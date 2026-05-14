
-- 1) Fix privilege escalation: only allow inserting student role for self
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;
CREATE POLICY "Users can insert own student role on signup"
ON public.user_roles
FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id AND role = 'student'::app_role);

-- 2) Restrict staff SELECT on students to only students in classes they teach
DROP POLICY IF EXISTS "Staff can view students" ON public.students;
CREATE POLICY "Staff can view their students"
ON public.students
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.staff s
    JOIN public.timetable_entries te ON te.staff_id = s.id
    JOIN public.student_classes sc ON sc.class_id = te.class_id
    WHERE s.user_id = auth.uid()
      AND sc.student_id = students.id
  )
);

-- 3) Restrict staff SELECT on profiles to self + students they teach + own dept staff
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
CREATE POLICY "Staff can view related profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'staff'::app_role)
  AND (
    -- their own students
    EXISTS (
      SELECT 1
      FROM public.students st
      JOIN public.student_classes sc ON sc.student_id = st.id
      JOIN public.timetable_entries te ON te.class_id = sc.class_id
      JOIN public.staff s ON s.id = te.staff_id
      WHERE s.user_id = auth.uid()
        AND st.user_id = profiles.user_id
    )
    OR
    -- other staff in the same department
    EXISTS (
      SELECT 1
      FROM public.staff me
      JOIN public.staff other ON other.department_id = me.department_id
      WHERE me.user_id = auth.uid()
        AND other.user_id = profiles.user_id
    )
  )
);

-- 4) Restrict staff SELECT on staff to own record + same department directory
DROP POLICY IF EXISTS "Staff can view all staff" ON public.staff;
CREATE POLICY "Staff can view department staff"
ON public.staff
FOR SELECT
TO public
USING (
  has_role(auth.uid(), 'staff'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.staff me
    WHERE me.user_id = auth.uid()
      AND me.department_id = staff.department_id
  )
);

-- 5) Hash invitation tokens at rest
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS token_hash text;

-- Backfill existing tokens
UPDATE public.invitations
SET token_hash = encode(extensions.digest(token, 'sha256'), 'hex')
WHERE token_hash IS NULL;

-- Trigger to keep token_hash in sync on insert/update
CREATE OR REPLACE FUNCTION public.set_invitation_token_hash()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.token IS NOT NULL THEN
    NEW.token_hash := encode(extensions.digest(NEW.token, 'sha256'), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_invitation_token_hash ON public.invitations;
CREATE TRIGGER trg_set_invitation_token_hash
BEFORE INSERT OR UPDATE OF token ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.set_invitation_token_hash();

-- Update validate function to use hash lookup
CREATE OR REPLACE FUNCTION public.validate_invitation_token(_token text)
RETURNS TABLE(email text, role app_role, expires_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT i.email, i.role, i.expires_at
  FROM public.invitations i
  WHERE i.token_hash = encode(extensions.digest(_token, 'sha256'), 'hex')
    AND i.used_at IS NULL
    AND i.expires_at > now()
  LIMIT 1;
$$;

-- Update handle_new_user_role to use hash lookup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role public.app_role;
  _invite_id uuid;
  _invitation_token text;
  _token_hash text;
BEGIN
  _invitation_token := NEW.raw_user_meta_data->>'invitation_token';

  IF _invitation_token IS NOT NULL AND length(_invitation_token) > 0 THEN
    _token_hash := encode(extensions.digest(_invitation_token, 'sha256'), 'hex');
    SELECT id, role
    INTO _invite_id, _role
    FROM public.invitations
    WHERE token_hash = _token_hash
      AND lower(email) = lower(NEW.email)
      AND used_at IS NULL
      AND expires_at > now()
    LIMIT 1;
  END IF;

  IF _role IS NULL THEN
    _role := 'student'::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF _invite_id IS NOT NULL THEN
    UPDATE public.invitations
    SET used_at = now()
    WHERE id = _invite_id;
  END IF;

  RETURN NEW;
END;
$$;
