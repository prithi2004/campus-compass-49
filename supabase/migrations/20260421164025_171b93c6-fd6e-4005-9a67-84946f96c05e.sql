-- Secure invitation lookup: remove broad public read access
DROP POLICY IF EXISTS "Anyone can read invitation by token" ON public.invitations;
DROP POLICY IF EXISTS "Users can view invitation by specific token" ON public.invitations;

-- Ensure only admins can manage invitation records directly
DROP POLICY IF EXISTS "Admins can view invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can delete invitations" ON public.invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Users can mark their invitation as used" ON public.invitations;

CREATE POLICY "Admins can view invitations"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can create invitations"
  ON public.invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete invitations"
  ON public.invitations
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update invitations"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can mark their invitation as used"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (
    used_at IS NULL
    AND expires_at > now()
    AND lower(email) = lower((auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    used_at IS NOT NULL
    AND lower(email) = lower((auth.jwt() ->> 'email'))
  );

CREATE OR REPLACE FUNCTION public.validate_invitation_token(_token text)
RETURNS TABLE(email text, role public.app_role, expires_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.email, i.role, i.expires_at
  FROM public.invitations i
  WHERE i.token = _token
    AND i.used_at IS NULL
    AND i.expires_at > now()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.validate_invitation_token(text) TO anon, authenticated;

-- Remove duplicate question bank read policy; the broader staff/admin management policy already covers reading.
DROP POLICY IF EXISTS "Staff can view question bank" ON public.question_bank;