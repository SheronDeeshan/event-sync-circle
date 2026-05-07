
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS online_url text;

ALTER TABLE public.circle_groups ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.circle_groups ADD COLUMN IF NOT EXISTS description text;

CREATE OR REPLACE FUNCTION public.notify_users(_user_ids uuid[], _type text, _title text, _body text, _event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_ids IS NULL OR array_length(_user_ids, 1) IS NULL THEN
    RETURN;
  END IF;
  INSERT INTO public.notifications (user_id, type, title, body, event_id)
  SELECT DISTINCT uid, _type::notification_type, _title, _body, _event_id
  FROM unnest(_user_ids) AS uid
  WHERE uid IS NOT NULL;
END;
$$;
