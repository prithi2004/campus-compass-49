CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _invite_id uuid;
  _invitation_token text;
BEGIN
  _invitation_token := NEW.raw_user_meta_data->>'invitation_token';

  IF _invitation_token IS NOT NULL AND length(_invitation_token) > 0 THEN
    SELECT id, role
    INTO _invite_id, _role
    FROM public.invitations
    WHERE token = _invitation_token
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