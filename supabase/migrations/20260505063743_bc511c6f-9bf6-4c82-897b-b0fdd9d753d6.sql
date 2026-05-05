DROP POLICY IF EXISTS "View visible events" ON public.events;

CREATE POLICY "View visible events"
ON public.events
FOR SELECT
TO authenticated
USING (
  organizer_id = auth.uid()
  OR privacy = 'public'::public.event_privacy
  OR EXISTS (
    SELECT 1
    FROM public.event_participants ep
    WHERE ep.event_id = events.id
      AND ep.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.anonymous_invites ai
    WHERE ai.event_id = events.id
      AND ai.invitee_id = auth.uid()
  )
  OR (
    privacy = 'private'::public.event_privacy
    AND coalesce(array_length(circle_group_ids, 1), 0) > 0
    AND (
      (
        private_rule = 'all'
        AND NOT EXISTS (
          SELECT 1
          FROM unnest(circle_group_ids) AS required_circle(circle_id)
          WHERE NOT public.is_circle_member(required_circle.circle_id, auth.uid())
        )
      )
      OR (
        private_rule <> 'all'
        AND EXISTS (
          SELECT 1
          FROM public.circle_members cm
          WHERE cm.user_id = auth.uid()
            AND cm.circle_id = ANY(events.circle_group_ids)
        )
      )
    )
  )
);