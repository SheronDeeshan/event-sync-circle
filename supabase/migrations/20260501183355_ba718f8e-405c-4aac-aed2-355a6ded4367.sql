
-- Lock down SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_circle_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_event_participant(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_view_event(UUID, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_organizer_as_participant() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- touch_updated_at needs explicit search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE PLPGSQL SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Tighten notifications insert
DROP POLICY IF EXISTS "Insert notifications for self or via system" ON public.notifications;
CREATE POLICY "Insert own notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
