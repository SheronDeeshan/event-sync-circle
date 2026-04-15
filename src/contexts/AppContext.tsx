import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  currentUser,
  mockEvents,
  mockCircleGroups,
  mockNotifications,
  mockMessages,
  mockExpenses,
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
  events: EventItem[];
  circleGroups: CircleGroup[];
  notifications: Notification[];
  selectedInterests: string[];
  messages: Record<string, Message[]>;
  expenses: Record<string, Expense[]>;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  setSelectedInterests: (interests: string[]) => void;
  joinEvent: (eventId: string) => void;
  requestJoinEvent: (eventId: string, message?: string) => void;
  handleJoinRequest: (eventId: string, requestId: string, status: JoinRequestStatus) => void;
  createEvent: (event: Omit<EventItem, "id" | "participants" | "organizer" | "status" | "joinRequests">) => void;
  addCircleGroup: (name: string, emoji: string) => void;
  removeCircleGroup: (id: string) => void;
  updateUserInterests: (interests: string[]) => void;
  sendMessage: (eventId: string, content: string) => void;
  addExpense: (eventId: string, expense: Omit<Expense, "id">) => void;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [circleGroups, setCircleGroups] = useState<CircleGroup[]>(mockCircleGroups);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [expenses, setExpenses] = useState<Record<string, Expense[]>>(mockExpenses);

  const login = (_email: string, _password: string) => {
    setUser(currentUser);
    setIsAuthenticated(true);
  };

  const signup = (name: string, email: string, _password: string) => {
    const newUser = { ...currentUser, name, email };
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const joinEvent = (eventId: string) => {
    if (!user) return;
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId && !e.participants.find((p) => p.id === user.id)
          ? { ...e, participants: [...e.participants, user] }
          : e
      )
    );
  };

  const requestJoinEvent = (eventId: string, message?: string) => {
    if (!user) return;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        if (e.joinRequests.find((r) => r.userId === user.id)) return e;
        return {
          ...e,
          joinRequests: [
            ...e.joinRequests,
            {
              id: `jr-${Date.now()}`,
              userId: user.id,
              eventId,
              status: "pending" as const,
              requestedAt: "Just now",
              message,
            },
          ],
        };
      })
    );
  };

  const handleJoinRequest = (eventId: string, requestId: string, status: JoinRequestStatus) => {
    const { mockUsers } = require("@/lib/mock-data");
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const request = e.joinRequests.find((r) => r.id === requestId);
        if (!request) return e;
        const updatedRequests = e.joinRequests.map((r) =>
          r.id === requestId ? { ...r, status } : r
        );
        let updatedParticipants = e.participants;
        if (status === "approved") {
          const userToAdd = mockUsers.find((u: User) => u.id === request.userId);
          if (userToAdd && !updatedParticipants.find((p) => p.id === request.userId)) {
            updatedParticipants = [...updatedParticipants, userToAdd];
          }
        }
        return { ...e, joinRequests: updatedRequests, participants: updatedParticipants };
      })
    );
  };

  const createEvent = (eventData: Omit<EventItem, "id" | "participants" | "organizer" | "status" | "joinRequests">) => {
    if (!user) return;
    const newEvent: EventItem = {
      ...eventData,
      id: String(Date.now()),
      participants: [user],
      organizer: eventData.privacy === "anonymous" ? { ...user, name: "Anonymous Organizer", isAnonymous: true } : user,
      status: "open",
      joinRequests: [],
    };
    setEvents((prev) => [newEvent, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newEvent.id]: [
        {
          id: "sys-1",
          senderId: "system",
          senderName: "Circle",
          senderAvatar: "",
          content: `Welcome to ${newEvent.title}! 🎉 This is your collaboration space.`,
          timestamp: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
          type: "system",
        },
      ],
    }));
    setExpenses((prev) => ({ ...prev, [newEvent.id]: [] }));
  };

  const addCircleGroup = (name: string, emoji: string) => {
    if (!user) return;
    const newGroup: CircleGroup = {
      id: `cg-${Date.now()}`,
      name,
      emoji,
      memberCount: 1,
      members: [user.id],
      createdBy: user.id,
    };
    setCircleGroups((prev) => [...prev, newGroup]);
  };

  const removeCircleGroup = (id: string) => {
    setCircleGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const updateUserInterests = (interests: string[]) => {
    if (!user) return;
    setUser({ ...user, interests });
  };

  const sendMessage = (eventId: string, content: string) => {
    if (!user) return;
    const newMsg: Message = {
      id: String(Date.now()),
      senderId: user.id,
      senderName: user.name.split(" ")[0],
      senderAvatar: "",
      content,
      timestamp: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newMsg],
    }));
  };

  const addExpense = (eventId: string, expense: Omit<Expense, "id">) => {
    const newExpense: Expense = { ...expense, id: String(Date.now()) };
    setExpenses((prev) => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), newExpense],
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        events,
        circleGroups,
        notifications,
        selectedInterests,
        messages,
        expenses,
        login,
        signup,
        logout,
        setSelectedInterests,
        joinEvent,
        requestJoinEvent,
        handleJoinRequest,
        createEvent,
        addCircleGroup,
        removeCircleGroup,
        updateUserInterests,
        sendMessage,
        addExpense,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
