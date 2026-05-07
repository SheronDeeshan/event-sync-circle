export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  interests: string[];
  isAnonymous: boolean;
  bio?: string;
}

export interface CircleGroup {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
  members: string[];
  createdBy: string;
  description?: string;
  avatarUrl?: string;
}

export type EventStatus = "draft" | "open" | "active" | "completed" | "cancelled";
export type JoinRequestStatus = "pending" | "approved" | "rejected";
export type PrivateRule = "any" | "all";

export interface JoinRequest {
  id: string;
  userId: string;
  eventId: string;
  status: JoinRequestStatus;
  requestedAt: string;
  message?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  date: string;
  endDate?: string;
  time: string;
  coverImage: string;
  tags: string[];
  circleGroups: string[];
  participantLimit: number;
  participants: User[];
  organizer: User;
  privacy: "public" | "private" | "anonymous";
  privateRule?: PrivateRule;
  status: EventStatus;
  anonymousInvites: string[];
  importedFrom?: "facebook" | "instagram" | "google" | null;
  joinRequests: JoinRequest[];
  transportInfo?: string;
  weatherAlertsEnabled?: boolean;
  createdAt?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type?: "text" | "system" | "image";
  imageUrl?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  paidById: string;
  splitAmong: string[];
  date: string;
  category: "food" | "transport" | "accommodation" | "activity" | "other";
}

export interface Notification {
  id: string;
  type:
    | "match" | "invite" | "accepted" | "join_request" | "expense"
    | "chat" | "anonymous_invite" | "request_approved" | "request_declined"
    | "alert" | "story" | "photo";
  title: string;
  description: string;
  time: string;
  unread: boolean;
  eventId?: string;
  actionRequired?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export interface EventAlert {
  id: string;
  eventId: string;
  kind: "date_change" | "location_change" | "transport" | "weather" | "general";
  title: string;
  body?: string;
  createdAt: string;
}

export interface EventPhoto {
  id: string;
  eventId: string;
  uploadedBy: string;
  uploaderName: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
}

export const INTEREST_TAGS = [
  "🥾 Hiking", "✈️ Travel", "⚽ Sports", "🎵 Music", "🎨 Art",
  "📚 Books", "🍳 Cooking", "🎮 Gaming", "📸 Photography", "🧘 Yoga",
  "🏄 Surfing", "🎬 Movies", "💃 Dancing", "🏕️ Camping", "🚴 Cycling",
];

export const EXPENSE_CATEGORIES = [
  { id: "food", emoji: "🍕", label: "Food & Drinks" },
  { id: "transport", emoji: "🚗", label: "Transport" },
  { id: "accommodation", emoji: "🏨", label: "Accommodation" },
  { id: "activity", emoji: "🎯", label: "Activity" },
  { id: "other", emoji: "📦", label: "Other" },
];

// Legacy mock arrays kept for any leftover references
export const mockUsers: User[] = [];
export const currentUser: User = { id: "", name: "", email: "", avatar: "", interests: [], isAnonymous: false };
export const mockCircleGroups: CircleGroup[] = [];
export const mockEvents: EventItem[] = [];
export const mockMessages: Record<string, Message[]> = {};
export const mockExpenses: Record<string, Expense[]> = {};
export const mockNotifications: Notification[] = [];
