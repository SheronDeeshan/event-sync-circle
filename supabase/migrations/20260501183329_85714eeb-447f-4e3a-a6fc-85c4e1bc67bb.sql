
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.event_privacy AS ENUM ('public', 'private', 'anonymous');
CREATE TYPE public.event_status AS ENUM ('draft', 'open', 'active', 'completed', 'cancelled');
CREATE TYPE public.join_request_status AS ENUM ('pending', 'approved', 'declined');
CREATE TYPE public.notification_type AS ENUM ('join_request', 'request_approved', 'request_declined', 'event_invite', 'new_message', 'event_update', 'anonymous_invite');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ CIRCLE GROUPS ============
CREATE TABLE public.circle_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '👥',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.circle_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circle_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = _circle_id AND user_id = _user_id) $$;

CREATE POLICY "View own or joined circles"
  ON public.circle_groups FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.is_circle_member(id, auth.uid()));
CREATE POLICY "Create circles"
  ON public.circle_groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Update own circles"
  ON public.circle_groups FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Delete own circles"
  ON public.circle_groups FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "View members of own/joined circles"
  ON public.circle_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_circle_member(circle_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.circle_groups WHERE id = circle_id AND created_by = auth.uid()));
CREATE POLICY "Circle creator can add members"
  ON public.circle_members FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.circle_groups WHERE id = circle_id AND created_by = auth.uid())
              OR user_id = auth.uid());
CREATE POLICY "Circle creator can remove members"
  ON public.circle_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.circle_groups WHERE id = circle_id AND created_by = auth.uid())
         OR user_id = auth.uid());

-- ============ EVENTS ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TEXT,
  cover_image TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  circle_group_ids UUID[] NOT NULL DEFAULT '{}',
  participant_limit INT NOT NULL DEFAULT 10,
  privacy event_privacy NOT NULL DEFAULT 'public',
  status event_status NOT NULL DEFAULT 'open',
  imported_from TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.anonymous_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, invitee_id)
);
ALTER TABLE public.anonymous_invites ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_event_participant(_event_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.event_participants WHERE event_id = _event_id AND user_id = _user_id) $$;

CREATE OR REPLACE FUNCTION public.can_view_event(_event_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = _event_id AND (
      e.privacy = 'public'
      OR e.organizer_id = _user_id
      OR public.is_event_participant(e.id, _user_id)
      OR EXISTS (SELECT 1 FROM public.anonymous_invites ai WHERE ai.event_id = e.id AND ai.invitee_id = _user_id)
      OR EXISTS (
        SELECT 1 FROM public.circle_members cm
        WHERE cm.user_id = _user_id AND cm.circle_id = ANY(e.circle_group_ids)
      )
    )
  )
$$;

CREATE POLICY "View visible events"
  ON public.events FOR SELECT TO authenticated USING (public.can_view_event(id, auth.uid()));
CREATE POLICY "Create own events"
  ON public.events FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());
CREATE POLICY "Update own events"
  ON public.events FOR UPDATE TO authenticated USING (organizer_id = auth.uid());
CREATE POLICY "Delete own events"
  ON public.events FOR DELETE TO authenticated USING (organizer_id = auth.uid());

CREATE POLICY "View participants of viewable events"
  ON public.event_participants FOR SELECT TO authenticated
  USING (public.can_view_event(event_id, auth.uid()));
CREATE POLICY "Join events as self"
  ON public.event_participants FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Leave events as self"
  ON public.event_participants FOR DELETE TO authenticated
  USING (user_id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));

CREATE POLICY "View own anon invites or as organizer"
  ON public.anonymous_invites FOR SELECT TO authenticated
  USING (invitee_id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Organizer can create anon invites"
  ON public.anonymous_invites FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Organizer can delete anon invites"
  ON public.anonymous_invites FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));

-- ============ JOIN REQUESTS ============
CREATE TABLE public.join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status join_request_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own requests or as organizer"
  ON public.join_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Create own join request"
  ON public.join_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Organizer updates request status"
  ON public.join_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "User cancels own request"
  ON public.join_requests FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view event messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_event_participant(event_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Participants send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid()
              AND (public.is_event_participant(event_id, auth.uid())
                   OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())));

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- ============ EXPENSES ============
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  split_with UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view expenses"
  ON public.expenses FOR SELECT TO authenticated
  USING (public.is_event_participant(event_id, auth.uid())
         OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid()));
CREATE POLICY "Participants add expenses"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (payer_id = auth.uid()
              AND (public.is_event_participant(event_id, auth.uid())
                   OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())));
CREATE POLICY "Payer can delete expense"
  ON public.expenses FOR DELETE TO authenticated USING (payer_id = auth.uid());

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  unread BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Insert notifications for self or via system"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============ TRIGGERS ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE PLPGSQL AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-add organizer as participant
CREATE OR REPLACE FUNCTION public.add_organizer_as_participant()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.event_participants (event_id, user_id)
  VALUES (NEW.id, NEW.organizer_id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_add_organizer
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.add_organizer_as_participant();
