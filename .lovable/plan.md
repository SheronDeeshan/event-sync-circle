# Platform Improvements Plan

Grouping the requests into 5 work areas. I'll execute in this order so each builds cleanly on the prior one.

---

## 1. Bottom nav: replace "Discover" with "Joined" (Circle Spaces)

- Bottom nav tab "Discover" becomes **"Joined"** — lists every event the current user has joined, each opening its **Circle Space** (collaboration view) directly.
- Discover stays accessible from the top-right button on Home (already implemented).
- Joined screen sections: Active (upcoming/in-progress) and Past.

## 2. Profile

- Friend count = `friends.length - 1` is not quite right (own user isn't in the friends list). Real fix: the current screen counts "circle members" including self. Change displayed count to **exclude the current user**.
- Visitor view already hides circles — keep, show event count only.

## 3. Alerts (notifications)

Add notification creation for these events. Notifications are written to `notifications` table by the actor side (RLS only allows inserting your own row, so we need a SECURITY DEFINER function `notify_users(uuids[], type, title, body, event_id)` to fan-out to others).

Triggers added:
- New member joined event → notify organizer + existing participants
- New chat message → notify other participants (debounced client-side: only if last notif >2min old)
- Budget item added/changed → notify participants
- Event field changed (location, date, time, title, cover) → notify participants
- Generic "event updated" alert

## 4. Event management

- **Edit event** screen (organizer only) — reuse CreateEvent form pre-filled.
- **Delete event** (organizer only) with confirm.
- **Share button** — copy public link to clipboard + Web Share API when available.
- **Open button** — already exists as "Open Circle Space" when joined; add a quick "Open" entry from cards for joined events.
- **Online events** — add `is_online` + `online_url` columns; CreateEvent toggle "Online event" hides location field, shows URL field.
- **No duplicate events** — block create if same `(organizer_id, title, start_date)` already exists for this user (DB unique index + friendly client error).
- Participant add/remove → already creates notifications via #3.

## 5. Circles

- **Searchable by name** — add search input on circle list.
- **Profile picture** for circle — add `avatar_url` column; upload in create/edit modal.
- **Short description / bio** — add `description` text column (e.g. "MIT, CS '24", "Acme team"); show under name in lists.

---

## Technical changes (DB)

```sql
ALTER TABLE events ADD COLUMN is_online boolean NOT NULL DEFAULT false;
ALTER TABLE events ADD COLUMN online_url text;
CREATE UNIQUE INDEX events_no_dupe ON events (organizer_id, lower(title), start_date);

ALTER TABLE circle_groups ADD COLUMN avatar_url text;
ALTER TABLE circle_groups ADD COLUMN description text;

CREATE FUNCTION public.notify_users(_user_ids uuid[], _type notification_type, _title text, _body text, _event_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, body, event_id)
  SELECT unnest(_user_ids), _type, _title, _body, _event_id;
END $$;
```

Files touched (approx):
- `BottomNav.tsx`, `Index.tsx` — Joined tab
- new `JoinedSpaces.tsx`
- `ProfileScreen.tsx` — friend count fix
- `AppContext.tsx` — `updateEvent`, `deleteEvent`, fan-out notifications via `notify_users` RPC
- `EventDetail.tsx` — Edit / Delete / Share buttons (organizer)
- new `EditEvent.tsx` (or reuse CreateEvent in edit mode)
- `CreateEvent.tsx` — online toggle, dupe check
- `Circles.tsx` (or wherever circles list lives) — search, avatar, description
- `collaboration/ChatTab.tsx`, `BudgetTab.tsx` — emit notifications

Since the scope is large, I'll ship in two passes:
**Pass A (this turn):** #1 Joined tab, #2 profile count, #4 share/edit/delete/online/dedupe, #5 circle search/avatar/description.
**Pass B (next turn):** #3 full alert fan-out wiring across chat/budget/event-edit.

Let me know if you'd rather flip the order or drop anything.
