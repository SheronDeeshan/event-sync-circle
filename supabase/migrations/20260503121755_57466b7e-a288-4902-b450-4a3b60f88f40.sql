
-- Circle invites table
CREATE TABLE public.circle_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.circle_groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  email TEXT,
  phone TEXT,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.circle_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Circle creator can create invites"
ON public.circle_invites FOR INSERT TO authenticated
WITH CHECK (
  invited_by = auth.uid()
  AND EXISTS (SELECT 1 FROM public.circle_groups WHERE id = circle_id AND created_by = auth.uid())
);

CREATE POLICY "Circle creator can delete invites"
ON public.circle_invites FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.circle_groups WHERE id = circle_id AND created_by = auth.uid()));

CREATE POLICY "View invites by creator or token holder"
ON public.circle_invites FOR SELECT TO authenticated
USING (
  invited_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.circle_groups WHERE id = circle_id AND created_by = auth.uid())
  OR accepted_by = auth.uid()
);

CREATE POLICY "Accepter marks invite accepted"
ON public.circle_invites FOR UPDATE TO authenticated
USING (accepted_at IS NULL)
WITH CHECK (accepted_by = auth.uid());

-- Avatar storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
