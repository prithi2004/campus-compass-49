
-- Invitations table for invite-based signup
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invitations
CREATE POLICY "Admins can manage invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read an invitation by token (for signup page)
CREATE POLICY "Anyone can read invitation by token"
  ON public.invitations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update handle_new_user_role to check for invitation
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  -- Check if there's an unused invitation for this email
  SELECT role INTO _role
  FROM public.invitations
  WHERE email = NEW.email
    AND used_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF _role IS NOT NULL THEN
    -- Use the invited role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Mark invitation as used
    UPDATE public.invitations
    SET used_at = now()
    WHERE email = NEW.email
      AND used_at IS NULL
      AND expires_at > now();
  ELSE
    -- Default to student
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;
