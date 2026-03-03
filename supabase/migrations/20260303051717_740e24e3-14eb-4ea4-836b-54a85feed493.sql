-- Update the role assignment trigger to read desired role from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _desired_role text;
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
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    UPDATE public.invitations
    SET used_at = now()
    WHERE email = NEW.email
      AND used_at IS NULL
      AND expires_at > now();
  ELSE
    -- Check if user specified a desired role in metadata
    _desired_role := NEW.raw_user_meta_data->>'desired_role';
    IF _desired_role IN ('admin', 'staff', 'student') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, _desired_role::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'student'::app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;