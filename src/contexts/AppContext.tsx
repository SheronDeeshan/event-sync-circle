import React, { createContext, useContext, useState, ReactNode } from "react";
import { currentUser, mockEvents, type User, type EventItem } from "@/lib/mock-data";

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  events: EventItem[];
  selectedInterests: string[];
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  setSelectedInterests: (interests: string[]) => void;
  joinEvent: (eventId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<EventItem[]>(mockEvents);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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

  return (
    <AppContext.Provider
      value={{ user, isAuthenticated, events, selectedInterests, login, signup, logout, setSelectedInterests, joinEvent }}
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
