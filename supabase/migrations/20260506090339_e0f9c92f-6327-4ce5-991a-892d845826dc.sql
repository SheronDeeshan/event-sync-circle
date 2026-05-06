DROP POLICY IF EXISTS "View visible events" ON public.events;

CREATE POLICY "View visible events"
ON public.events
FOR SELECT
TO authenticated
USING (public.can_view_event(id, auth.uid()));