import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  type User,
  type EventItem,
  type CircleGroup,
  type Notification,
  type Message,
  type Expense,
  type JoinRequestStatus,
} from "@/lib/mock-data";

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  events: EventItem[];
  circleGroups: CircleGroup[];
  notifications: Notification[];
  selectedInterests: string[];
  messages: Record<string, Message[]>;
  expenses: Record<string, Expense[]>;
  profiles: User[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedInterests: (interests: string[]) => void;
  joinEvent: (eventId: string) => Promise<void>;
  requestJoinEvent: (eventId: string, message?: string) => Promise<void>;
  handleJoinRequest: (eventId: string, requestId: string, status: JoinRequestStatus) => Promise<void>;
  createEvent: (event: Omit<EventItem, "id" | "participants" | "organizer" | "status" | "joinRequests">) => Promise<void>;
  addCircleGroup: (name: string, emoji: string) => Promise<void>;
  removeCircleGroup: (id: string) => Promise<void>;
  updateUserInterests: (interests: string[]) => Promise<void>;
  sendMessage: (eventId: string, content: string) => Promise<void>;
  addExpense: (eventId: string, expense: Omit<Expense, "id">) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  updateUserProfile: (updates: { name?: string; bio?: string; avatar?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  addCircleMember: (circleId: string, userId: string) => Promise<void>;
  removeCircleMember: (circleId: string, userId: string) => Promise<void>;
  createCircleInvite: (circleId: string, channel: { email?: string; phone?: string }) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const profileToUser = (p: any): User => ({
  id: p.id,
  name: p.name || "User",
  email: p.email || "",
  avatar: p.avatar_url || "",
  interests: p.interests || [],
  isAnonymous: false,
  bio: p.bio || "",
});

const ANONYMOUS_USER: User = {
  id: "anonymous",
  name: "Anonymous Organizer",
  email: "",
  avatar: "",
  interests: [],
  isAnonymous: true,
};

const reqStatusFromDb = (s: string): JoinRequestStatus =>
  s === "approved" ? "approved" : s === "declined" ? "rejected" : "pending";
const reqStatusToDb = (s: JoinRequestStatus): "approved" | "declined" | "pending" =>
  s === "rejected" ? "declined" : (s as "approved" | "pending");

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [circleGroups, setCircleGroups] = useState<CircleGroup[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>({});
  const [profilesCache, setProfilesCache] = useState<Record<string, User>>({});

  // ====== AUTH ======
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) {
        setUser(null);
        setEvents([]); setCircleGroups([]); setNotifications([]);
        setMessages({}); setExpenses({});
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load current user's profile when session changes
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (data) {
        const u = profileToUser(data);
        setUser(u);
        setProfilesCache((c) => ({ ...c, [u.id]: u }));
      }
      // Accept circle invite if present in URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("invite");
      if (token) {
        const { data: inv } = await supabase.from("circle_invites")
          .select("*").eq("token", token).maybeSingle();
        if (inv && !inv.accepted_at) {
          await supabase.from("circle_members").insert({ circle_id: inv.circle_id, user_id: session.user.id });
          await supabase.from("circle_invites").update({
            accepted_at: new Date().toISOString(), accepted_by: session.user.id,
          }).eq("id", inv.id);
          toast.success("Joined circle!");
        }
        params.delete("invite");
        const newUrl = window.location.pathname + (params.toString() ? `?${params}` : "");
        window.history.replaceState({}, "", newUrl);
      }
    })();
  }, [session?.user?.id]);

  // ====== DATA LOADERS ======
  const loadAll = useCallback(async () => {
    if (!session?.user) return;
    const uid = session.user.id;

    const [profilesRes, eventsRes, partsRes, reqsRes, anonRes, circlesRes, membersRes, notifsRes] =
      await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("events").select("*").order("start_date", { ascending: true }),
        supabase.from("event_participants").select("*"),
        supabase.from("join_requests").select("*"),
        supabase.from("anonymous_invites").select("*"),
        supabase.from("circle_groups").select("*"),
        supabase.from("circle_members").select("*"),
        supabase.from("notifications").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);

    const profiles: Record<string, User> = {};
    (profilesRes.data || []).forEach((p) => { profiles[p.id] = profileToUser(p); });
    setProfilesCache(profiles);

    // Build events
    const partsByEvent: Record<string, string[]> = {};
    (partsRes.data || []).forEach((p) => {
      partsByEvent[p.event_id] ||= [];
      partsByEvent[p.event_id].push(p.user_id);
    });
    const reqsByEvent: Record<string, any[]> = {};
    (reqsRes.data || []).forEach((r) => {
      reqsByEvent[r.event_id] ||= [];
      reqsByEvent[r.event_id].push(r);
    });
    const anonByEvent: Record<string, string[]> = {};
    (anonRes.data || []).forEach((a) => {
      anonByEvent[a.event_id] ||= [];
      anonByEvent[a.event_id].push(a.invitee_id);
    });

    const builtEvents: EventItem[] = (eventsRes.data || []).map((e) => {
      const organizer =
        e.privacy === "anonymous" && e.organizer_id !== uid
          ? ANONYMOUS_USER
          : profiles[e.organizer_id] || ANONYMOUS_USER;
      return {
        id: e.id,
        title: e.title,
        description: e.description || "",
        location: e.location || "",
        date: e.start_date,
        endDate: e.end_date || undefined,
        time: e.start_time || "",
        coverImage: e.cover_image || "",
        tags: e.tags || [],
        circleGroups: e.circle_group_ids || [],
        participantLimit: e.participant_limit,
        participants: (partsByEvent[e.id] || []).map((id) => profiles[id]).filter(Boolean),
        organizer,
        privacy: e.privacy,
        status: e.status,
        anonymousInvites: anonByEvent[e.id] || [],
        importedFrom: e.imported_from as any,
        joinRequests: (reqsByEvent[e.id] || []).map((r) => ({
          id: r.id,
          userId: r.user_id,
          eventId: r.event_id,
          status: reqStatusFromDb(r.status),
          requestedAt: new Date(r.created_at).toLocaleString(),
          message: r.message || undefined,
        })),
      };
    });
    setEvents(builtEvents);

    // Circles
    const membersByCircle: Record<string, string[]> = {};
    (membersRes.data || []).forEach((m) => {
      membersByCircle[m.circle_id] ||= [];
      membersByCircle[m.circle_id].push(m.user_id);
    });
    setCircleGroups(
      (circlesRes.data || []).map((g) => ({
        id: g.id, name: g.name, emoji: g.emoji,
        memberCount: (membersByCircle[g.id] || []).length,
        members: membersByCircle[g.id] || [],
        createdBy: g.created_by,
      }))
    );

    // Notifications
    setNotifications(
      (notifsRes.data || []).map((n) => ({
        id: n.id,
        type: n.type as any,
        title: n.title,
        description: n.body || "",
        time: new Date(n.created_at).toLocaleString(),
        unread: n.unread,
        eventId: n.event_id || undefined,
      }))
    );
  }, [session?.user?.id]);

  useEffect(() => { if (session?.user) loadAll(); }, [session?.user?.id, loadAll]);

  // Realtime: messages and notifications
  useEffect(() => {
    if (!session?.user) return;
    const ch = supabase
      .channel("app-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m: any = payload.new;
        setMessages((prev) => {
          const list = prev[m.event_id] || [];
          if (list.some((x) => x.id === m.id)) return prev;
          const senderProfile = profilesCache[m.sender_id];
          return {
            ...prev,
            [m.event_id]: [...list, {
              id: m.id,
              senderId: m.sender_id || "system",
              senderName: m.message_type === "system" ? "Circle" : (senderProfile?.name?.split(" ")[0] || "User"),
              senderAvatar: senderProfile?.avatar || "",
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
              type: m.message_type === "system" ? "system" : "text",
            }],
          };
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${session.user.id}` }, (payload) => {
        const n: any = payload.new;
        setNotifications((prev) => [{
          id: n.id, type: n.type, title: n.title, description: n.body || "",
          time: "Just now", unread: n.unread, eventId: n.event_id || undefined,
        }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session?.user?.id, profilesCache]);

  // Lazy-load messages & expenses for an event when needed
  const ensureEventCollab = useCallback(async (eventId: string) => {
    if (messages[eventId] === undefined) {
      const { data } = await supabase.from("messages").select("*").eq("event_id", eventId).order("created_at");
      setMessages((prev) => ({
        ...prev,
        [eventId]: (data || []).map((m: any) => {
          const sp = profilesCache[m.sender_id];
          return {
            id: m.id,
            senderId: m.sender_id || "system",
            senderName: m.message_type === "system" ? "Circle" : (sp?.name?.split(" ")[0] || "User"),
            senderAvatar: sp?.avatar || "",
            content: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
            type: m.message_type === "system" ? "system" : "text",
          };
        }),
      }));
    }
    if (expenses[eventId] === undefined) {
      const { data } = await supabase.from("expenses").select("*").eq("event_id", eventId).order("created_at");
      setExpenses((prev) => ({
        ...prev,
        [eventId]: (data || []).map((e: any) => {
          const payer = profilesCache[e.payer_id];
          return {
            id: e.id,
            title: e.description,
            amount: Number(e.amount),
            paidBy: payer?.name || "User",
            paidById: e.payer_id,
            splitAmong: e.split_with || [],
            date: new Date(e.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
            category: "other" as const,
          };
        }),
      }));
    }
  }, [messages, expenses, profilesCache]);

  // Auto-load collab data for joined events as they appear
  useEffect(() => {
    if (!user) return;
    events.forEach((e) => {
      if (e.participants.some((p) => p.id === user.id)) ensureEventCollab(e.id);
    });
  }, [events, user, ensureEventCollab]);

  // ====== AUTH ACTIONS ======
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); throw error; }
  };
  const signup = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/`, data: { name } },
    });
    if (error) { toast.error(error.message); throw error; }
    toast.success("Welcome to Circle!");
  };
  const logout = async () => { await supabase.auth.signOut(); };

  // ====== EVENTS ======
  const joinEvent = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase.from("event_participants").insert({ event_id: eventId, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    await loadAll();
  };

  const requestJoinEvent = async (eventId: string, message?: string) => {
    if (!user) return;
    const { error } = await supabase.from("join_requests").insert({
      event_id: eventId, user_id: user.id, message: message || null,
    });
    if (error) { toast.error(error.message); return; }
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      await supabase.from("notifications").insert({
        user_id: ev.organizer.id,
        type: "join_request",
        title: "New join request",
        body: `${user.name} wants to join ${ev.title}`,
        event_id: eventId,
      });
    }
    toast.success("Request sent");
    await loadAll();
  };

  const handleJoinRequest = async (eventId: string, requestId: string, status: JoinRequestStatus) => {
    const ev = events.find((e) => e.id === eventId);
    const req = ev?.joinRequests.find((r) => r.id === requestId);
    if (!ev || !req) return;

    const { error } = await supabase.from("join_requests")
      .update({ status: reqStatusToDb(status) }).eq("id", requestId);
    if (error) { toast.error(error.message); return; }

    if (status === "approved") {
      await supabase.from("event_participants").insert({ event_id: eventId, user_id: req.userId });
      await supabase.from("notifications").insert({
        user_id: req.userId, type: "request_approved",
        title: "You've been accepted!", body: `Welcome to ${ev.title}`, event_id: eventId,
      });
    } else {
      await supabase.from("notifications").insert({
        user_id: req.userId, type: "request_declined",
        title: "Request declined", body: `Your request to join ${ev.title} was declined`, event_id: eventId,
      });
    }
    await loadAll();
  };

  const createEvent = async (eventData: Omit<EventItem, "id" | "participants" | "organizer" | "status" | "joinRequests">) => {
    if (!user) return;
    const { data: created, error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      start_date: eventData.date,
      end_date: eventData.endDate || null,
      start_time: eventData.time || null,
      cover_image: eventData.coverImage || null,
      tags: eventData.tags,
      circle_group_ids: eventData.circleGroups,
      participant_limit: eventData.participantLimit,
      privacy: eventData.privacy,
      imported_from: eventData.importedFrom || null,
    }).select().single();
    if (error || !created) { toast.error(error?.message || "Failed"); return; }

    if (eventData.anonymousInvites?.length) {
      await supabase.from("anonymous_invites").insert(
        eventData.anonymousInvites.map((invitee_id) => ({ event_id: created.id, invitee_id }))
      );
      await supabase.from("notifications").insert(
        eventData.anonymousInvites.map((invitee_id) => ({
          user_id: invitee_id, type: "anonymous_invite" as const,
          title: "Someone thinks you'd like this!",
          body: `You've been anonymously suggested for ${created.title}`,
          event_id: created.id,
        }))
      );
    }

    await supabase.from("messages").insert({
      event_id: created.id, sender_id: user.id, message_type: "system",
      content: `Welcome to ${created.title}! 🎉 This is your collaboration space.`,
    });

    toast.success("Event created");
    await loadAll();
  };

  // ====== CIRCLES ======
  const addCircleGroup = async (name: string, emoji: string) => {
    if (!user) return;
    const { data: g, error } = await supabase.from("circle_groups")
      .insert({ name, emoji, created_by: user.id }).select().single();
    if (error || !g) { toast.error(error?.message || "Failed"); return; }
    await supabase.from("circle_members").insert({ circle_id: g.id, user_id: user.id });
    await loadAll();
  };

  const removeCircleGroup = async (id: string) => {
    const { error } = await supabase.from("circle_groups").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await loadAll();
  };

  const updateUserInterests = async (interests: string[]) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ interests }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    setUser({ ...user, interests });
  };

  // ====== CHAT / EXPENSES ======
  const sendMessage = async (eventId: string, content: string) => {
    if (!user) return;
    const { error } = await supabase.from("messages").insert({
      event_id: eventId, sender_id: user.id, content, message_type: "user",
    });
    if (error) toast.error(error.message);
  };

  const addExpense = async (eventId: string, expense: Omit<Expense, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("expenses").insert({
      event_id: eventId, payer_id: user.id,
      description: expense.title, amount: expense.amount, split_with: expense.splitAmong,
    }).select().single();
    if (error || !data) { toast.error(error?.message || "Failed"); return; }
    setExpenses((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), {
        id: data.id, title: data.description, amount: Number(data.amount),
        paidBy: user.name, paidById: user.id, splitAmong: data.split_with,
        date: new Date(data.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
        category: expense.category,
      }],
    }));
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));
    await supabase.from("notifications").update({ unread: false }).eq("id", id);
  };

  // ====== PROFILE EDIT ======
  const updateUserProfile = async (updates: { name?: string; bio?: string; avatar?: string }) => {
    if (!user) return;
    const dbPatch: any = {};
    if (updates.name !== undefined) dbPatch.name = updates.name;
    if (updates.bio !== undefined) dbPatch.bio = updates.bio;
    if (updates.avatar !== undefined) dbPatch.avatar_url = updates.avatar;
    const { error } = await supabase.from("profiles").update(dbPatch).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    setUser({
      ...user,
      name: updates.name ?? user.name,
      bio: updates.bio ?? user.bio,
      avatar: updates.avatar ?? user.avatar,
    });
    toast.success("Profile updated");
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return null; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const addCircleMember = async (circleId: string, userId: string) => {
    const { error } = await supabase.from("circle_members").insert({ circle_id: circleId, user_id: userId });
    if (error) { toast.error(error.message); return; }
    toast.success("Member added");
    await loadAll();
  };

  const removeCircleMember = async (circleId: string, userId: string) => {
    const { error } = await supabase.from("circle_members").delete()
      .eq("circle_id", circleId).eq("user_id", userId);
    if (error) { toast.error(error.message); return; }
    await loadAll();
  };

  const createCircleInvite = async (circleId: string, channel: { email?: string; phone?: string }) => {
    if (!user) return null;
    const { data, error } = await supabase.from("circle_invites").insert({
      circle_id: circleId, invited_by: user.id,
      email: channel.email || null, phone: channel.phone || null,
    }).select().single();
    if (error || !data) { toast.error(error?.message || "Failed"); return null; }
    return `${window.location.origin}/?invite=${data.token}`;
  };

  return (
    <AppContext.Provider value={{
      user, isAuthenticated: !!session, loading,
      events, circleGroups, notifications, selectedInterests, messages, expenses,
      profiles: Object.values(profilesCache),
      login, signup, logout, setSelectedInterests,
      joinEvent, requestJoinEvent, handleJoinRequest, createEvent,
      addCircleGroup, removeCircleGroup, updateUserInterests,
      sendMessage, addExpense, markNotificationRead,
      updateUserProfile, uploadAvatar,
      addCircleMember, removeCircleMember, createCircleInvite,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
