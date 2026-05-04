
-- New columns
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS private_rule text NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS transport_info text,
  ADD COLUMN IF NOT EXISTS weather_alerts_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- Stories (24h)
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- helper: are two users in any common circle?
CREATE OR REPLACE FUNCTION public.shares_circle(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.circle_members m1
    JOIN public.circle_members m2 ON m1.circle_id = m2.circle_id
    WHERE m1.user_id = _a AND m2.user_id = _b
  )
$$;

CREATE POLICY "View own or circle stories" ON public.stories FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.shares_circle(user_id, auth.uid()));
CREATE POLICY "Create own stories" ON public.stories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own stories" ON public.stories FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Event alerts
CREATE TABLE IF NOT EXISTS public.event_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  kind text NOT NULL, -- date_change, location_change, transport, weather, general
  title text NOT NULL,
  body text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view alerts" ON public.event_alerts FOR SELECT TO authenticated
  USING (public.is_event_participant(event_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_alerts.event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Organizer creates alerts" ON public.event_alerts FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid()
              AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_alerts.event_id AND e.organizer_id = auth.uid()));

-- Event photo album
CREATE TABLE IF NOT EXISTS public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  uploaded_by uuid NOT NULL,
  image_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view photos" ON public.event_photos FOR SELECT TO authenticated
  USING (public.is_event_participant(event_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_photos.event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Participants add photos" ON public.event_photos FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid()
              AND (public.is_event_participant(event_id, auth.uid())
                   OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_photos.event_id AND e.organizer_id = auth.uid())));
CREATE POLICY "Uploader deletes photo" ON public.event_photos FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid());

-- Pinned messages
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  message_id uuid NOT NULL,
  pinned_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, message_id)
);
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view pinned" ON public.pinned_messages FOR SELECT TO authenticated
  USING (public.is_event_participant(event_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = pinned_messages.event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Participants pin" ON public.pinned_messages FOR INSERT TO authenticated
  WITH CHECK (pinned_by = auth.uid()
              AND (public.is_event_participant(event_id, auth.uid())
                   OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = pinned_messages.event_id AND e.organizer_id = auth.uid())));
CREATE POLICY "Pinner unpins" ON public.pinned_messages FOR DELETE TO authenticated
  USING (pinned_by = auth.uid()
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = pinned_messages.event_id AND e.organizer_id = auth.uid()));

-- Message reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view reactions" ON public.message_reactions FOR SELECT TO authenticated
  USING (public.is_event_participant(event_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = message_reactions.event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Participants react" ON public.message_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()
              AND (public.is_event_participant(event_id, auth.uid())
                   OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = message_reactions.event_id AND e.organizer_id = auth.uid())));
CREATE POLICY "Remove own reaction" ON public.message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('message-media', 'message-media', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop+create to avoid conflicts)
DO $$ BEGIN
  CREATE POLICY "Public read stories" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Owner upload stories" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Owner delete stories" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read event-photos" ON storage.objects FOR SELECT USING (bucket_id = 'event-photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Auth upload event-photos" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'event-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Public read message-media" ON storage.objects FOR SELECT USING (bucket_id = 'message-media');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Auth upload message-media" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'message-media' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Override can_view_event to enforce private circle rule
CREATE OR REPLACE FUNCTION public.can_view_event(_event_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  e public.events;
  needs_all boolean;
  cg uuid;
BEGIN
  SELECT * INTO e FROM public.events WHERE id = _event_id;
  IF e IS NULL THEN RETURN false; END IF;
  IF e.organizer_id = _user_id THEN RETURN true; END IF;
  IF public.is_event_participant(e.id, _user_id) THEN RETURN true; END IF;
  IF EXISTS (SELECT 1 FROM public.anonymous_invites ai WHERE ai.event_id = e.id AND ai.invitee_id = _user_id) THEN RETURN true; END IF;
  IF e.privacy = 'public' THEN RETURN true; END IF;
  IF e.privacy = 'anonymous' THEN
    -- Anonymous events: only invitees, organizer, participants (all handled above)
    RETURN false;
  END IF;
  -- Private: check circle rule
  IF coalesce(array_length(e.circle_group_ids, 1), 0) = 0 THEN RETURN false; END IF;
  needs_all := (e.private_rule = 'all');
  IF needs_all THEN
    -- user must be in EVERY listed circle
    FOREACH cg IN ARRAY e.circle_group_ids LOOP
      IF NOT public.is_circle_member(cg, _user_id) THEN RETURN false; END IF;
    END LOOP;
    RETURN true;
  ELSE
    RETURN EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.user_id = _user_id AND cm.circle_id = ANY(e.circle_group_ids)
    );
  END IF;
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
