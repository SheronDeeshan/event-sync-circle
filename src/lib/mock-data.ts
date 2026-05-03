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
  members: string[]; // user ids
  createdBy: string;
}

export type EventStatus = "draft" | "open" | "active" | "completed" | "cancelled";
export type JoinRequestStatus = "pending" | "approved" | "rejected";

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
  status: EventStatus;
  anonymousInvites: string[];
  importedFrom?: "facebook" | "instagram" | "google" | null;
  joinRequests: JoinRequest[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type?: "text" | "system";
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
  type: "match" | "invite" | "accepted" | "join_request" | "expense" | "chat" | "anonymous_invite";
  title: string;
  description: string;
  time: string;
  unread: boolean;
  eventId?: string;
  actionRequired?: boolean;
}

export const INTEREST_TAGS = [
  "🥾 Hiking",
  "✈️ Travel",
  "⚽ Sports",
  "🎵 Music",
  "🎨 Art",
  "📚 Books",
  "🍳 Cooking",
  "🎮 Gaming",
  "📸 Photography",
  "🧘 Yoga",
  "🏄 Surfing",
  "🎬 Movies",
  "💃 Dancing",
  "🏕️ Camping",
  "🚴 Cycling",
];

export const EXPENSE_CATEGORIES = [
  { id: "food", emoji: "🍕", label: "Food & Drinks" },
  { id: "transport", emoji: "🚗", label: "Transport" },
  { id: "accommodation", emoji: "🏨", label: "Accommodation" },
  { id: "activity", emoji: "🎯", label: "Activity" },
  { id: "other", emoji: "📦", label: "Other" },
];

export const mockUsers: User[] = [
  { id: "1", name: "Alex Chen", email: "alex@circle.app", avatar: "", interests: ["🥾 Hiking", "📸 Photography", "🏕️ Camping"], isAnonymous: false },
  { id: "2", name: "Maya Johnson", email: "maya@circle.app", avatar: "", interests: ["✈️ Travel", "🍳 Cooking", "🎨 Art"], isAnonymous: false },
  { id: "3", name: "Sam Rivera", email: "sam@circle.app", avatar: "", interests: ["⚽ Sports", "🚴 Cycling", "🥾 Hiking"], isAnonymous: false },
  { id: "4", name: "Jordan Lee", email: "jordan@circle.app", avatar: "", interests: ["🎵 Music", "💃 Dancing", "🎬 Movies"], isAnonymous: false },
  { id: "5", name: "Anonymous Organizer", email: "", avatar: "", interests: [], isAnonymous: true },
  { id: "6", name: "Riley Kim", email: "riley@circle.app", avatar: "", interests: ["🧘 Yoga", "🏄 Surfing", "📸 Photography"], isAnonymous: false },
  { id: "7", name: "Taylor Patel", email: "taylor@circle.app", avatar: "", interests: ["🎮 Gaming", "🎬 Movies", "🍳 Cooking"], isAnonymous: false },
];

export const currentUser = mockUsers[0];

export const mockCircleGroups: CircleGroup[] = [
  { id: "cg1", name: "Uni Friends", emoji: "🎓", memberCount: 12, members: ["1", "2", "3", "4", "6"], createdBy: "1" },
  { id: "cg2", name: "Uni Close Friends", emoji: "💛", memberCount: 5, members: ["1", "2", "3"], createdBy: "1" },
  { id: "cg3", name: "ABC Company Friends", emoji: "💼", memberCount: 8, members: ["1", "4", "7"], createdBy: "1" },
  { id: "cg4", name: "Gym Crew", emoji: "💪", memberCount: 6, members: ["1", "3", "6"], createdBy: "1" },
  { id: "cg5", name: "Travel Buddies", emoji: "✈️", memberCount: 4, members: ["1", "2", "6"], createdBy: "1" },
  { id: "cg6", name: "Neighborhood Pals", emoji: "🏡", memberCount: 9, members: ["1", "7"], createdBy: "1" },
];

export const mockEvents: EventItem[] = [
  {
    id: "1",
    title: "Sunrise Mountain Hike",
    description: "Join us for an early morning hike to catch the breathtaking sunrise from the summit. We'll take the scenic trail with amazing photo opportunities along the way.",
    location: "Runyon Canyon, Los Angeles",
    date: "2026-04-12",
    time: "5:30 AM",
    coverImage: "",
    tags: ["🥾 Hiking", "📸 Photography", "🏕️ Camping"],
    circleGroups: ["cg1"],
    participantLimit: 12,
    participants: [mockUsers[0], mockUsers[2]],
    organizer: mockUsers[2],
    privacy: "public",
    status: "active",
    anonymousInvites: [],
    joinRequests: [
      { id: "jr1", userId: "6", eventId: "1", status: "pending", requestedAt: "2 hours ago", message: "Would love to join! I love hiking 🥾" },
    ],
  },
  {
    id: "2",
    title: "Weekend Beach Getaway",
    description: "A relaxing weekend trip to Malibu with surfing, bonfires, and great company. All skill levels welcome!",
    location: "Malibu Beach, California",
    date: "2026-04-18",
    endDate: "2026-04-20",
    time: "10:00 AM",
    coverImage: "",
    tags: ["✈️ Travel", "🏄 Surfing"],
    circleGroups: ["cg2", "cg5"],
    participantLimit: 8,
    participants: [mockUsers[0], mockUsers[1], mockUsers[3]],
    organizer: mockUsers[1],
    privacy: "public",
    status: "active",
    anonymousInvites: ["3"],
    joinRequests: [],
  },
  {
    id: "3",
    title: "Secret Rooftop Jam Session",
    description: "Bring your instruments or just your vibes. An anonymous event for music lovers to connect.",
    location: "Downtown LA Rooftop",
    date: "2026-04-20",
    time: "7:00 PM",
    coverImage: "",
    tags: ["🎵 Music", "💃 Dancing"],
    circleGroups: [],
    participantLimit: 20,
    participants: [mockUsers[3]],
    organizer: mockUsers[4],
    privacy: "anonymous",
    status: "open",
    anonymousInvites: ["1", "2"],
    joinRequests: [
      { id: "jr2", userId: "7", eventId: "3", status: "pending", requestedAt: "5 hours ago" },
    ],
  },
  {
    id: "4",
    title: "Art & Wine Evening",
    description: "Paint, sip wine, and enjoy creative conversations with fellow art enthusiasts.",
    location: "The Gallery Space, Santa Monica",
    date: "2026-04-25",
    time: "6:00 PM",
    coverImage: "",
    tags: ["🎨 Art", "🍳 Cooking"],
    circleGroups: ["cg3"],
    participantLimit: 15,
    participants: [mockUsers[1]],
    organizer: mockUsers[1],
    privacy: "public",
    status: "open",
    anonymousInvites: [],
    joinRequests: [],
  },
  {
    id: "5",
    title: "3-Day Camping Adventure",
    description: "Escape the city for a 3-day camping trip in Joshua Tree. Stargazing, campfires, and hiking included!",
    location: "Joshua Tree National Park",
    date: "2026-05-01",
    endDate: "2026-05-03",
    time: "8:00 AM",
    coverImage: "",
    tags: ["🏕️ Camping", "🥾 Hiking", "📸 Photography"],
    circleGroups: ["cg4", "cg5"],
    participantLimit: 10,
    participants: [mockUsers[0], mockUsers[2], mockUsers[5]],
    organizer: mockUsers[0],
    privacy: "private",
    status: "active",
    anonymousInvites: [],
    joinRequests: [
      { id: "jr3", userId: "4", eventId: "5", status: "pending", requestedAt: "1 day ago", message: "This sounds amazing!" },
      { id: "jr4", userId: "7", eventId: "5", status: "pending", requestedAt: "6 hours ago" },
    ],
  },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "1", senderId: "3", senderName: "Sam", senderAvatar: "", content: "Hey everyone! Ready for the hike? 🥾", timestamp: "8:30 AM" },
    { id: "2", senderId: "1", senderName: "Alex", senderAvatar: "", content: "Can't wait! Bringing my wide-angle lens 📸", timestamp: "8:45 AM" },
    { id: "3", senderId: "3", senderName: "Sam", senderAvatar: "", content: "Perfect! The trail should be quiet that early", timestamp: "9:00 AM" },
  ],
  "2": [
    { id: "1", senderId: "2", senderName: "Maya", senderAvatar: "", content: "Hey everyone! So excited for this trip! 🎉", timestamp: "10:30 AM" },
    { id: "2", senderId: "3", senderName: "Sam", senderAvatar: "", content: "Should we carpool? I can drive 3 people", timestamp: "10:45 AM" },
    { id: "3", senderId: "1", senderName: "Alex", senderAvatar: "", content: "That would be great! I'll bring my camera gear 📸", timestamp: "11:00 AM" },
    { id: "4", senderId: "4", senderName: "Jordan", senderAvatar: "", content: "Don't forget sunscreen! The forecast looks sunny ☀️", timestamp: "11:15 AM" },
    { id: "5", senderId: "2", senderName: "Maya", senderAvatar: "", content: "I'll prepare some snacks for the group", timestamp: "11:30 AM" },
  ],
  "5": [
    { id: "1", senderId: "1", senderName: "Alex", senderAvatar: "", content: "Who's bringing the tent? I have a 4-person one 🏕️", timestamp: "2:00 PM" },
    { id: "2", senderId: "3", senderName: "Sam", senderAvatar: "", content: "I'll bring the cooking gear and stove", timestamp: "2:15 PM" },
    { id: "3", senderId: "6", senderName: "Riley", senderAvatar: "", content: "I've got sleeping bags covered! Also bringing a star map 🌟", timestamp: "2:30 PM" },
    { id: "4", senderId: "1", senderName: "Alex", senderAvatar: "", content: "Perfect squad! Let's finalize the budget", timestamp: "3:00 PM" },
  ],
};

export const mockExpenses: Record<string, Expense[]> = {
  "1": [
    { id: "1", title: "Trail snacks", amount: 25.00, paidBy: "Sam Rivera", paidById: "3", splitAmong: ["1", "3"], date: "Apr 10", category: "food" },
  ],
  "2": [
    { id: "1", title: "Gas for road trip", amount: 45.00, paidBy: "Sam Rivera", paidById: "3", splitAmong: ["1", "2", "3", "4"], date: "Apr 10", category: "transport" },
    { id: "2", title: "Snacks & drinks", amount: 32.50, paidBy: "Maya Johnson", paidById: "2", splitAmong: ["1", "2", "3", "4"], date: "Apr 11", category: "food" },
    { id: "3", title: "Beach house deposit", amount: 200.00, paidBy: "Alex Chen", paidById: "1", splitAmong: ["1", "2", "3", "4"], date: "Apr 9", category: "accommodation" },
    { id: "4", title: "Surfboard rental", amount: 60.00, paidBy: "Jordan Lee", paidById: "4", splitAmong: ["1", "3", "4"], date: "Apr 12", category: "activity" },
  ],
  "5": [
    { id: "1", title: "Campsite booking", amount: 120.00, paidBy: "Alex Chen", paidById: "1", splitAmong: ["1", "3", "6"], date: "Apr 28", category: "accommodation" },
    { id: "2", title: "Groceries for 3 days", amount: 85.00, paidBy: "Sam Rivera", paidById: "3", splitAmong: ["1", "3", "6"], date: "Apr 30", category: "food" },
    { id: "3", title: "Gas", amount: 55.00, paidBy: "Riley Kim", paidById: "6", splitAmong: ["1", "3", "6"], date: "May 1", category: "transport" },
  ],
};

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "anonymous_invite",
    title: "Someone thinks you'd like this!",
    description: "You've been anonymously suggested for Secret Rooftop Jam Session 🎵",
    time: "Just now",
    unread: true,
    eventId: "3",
  },
  {
    id: "2",
    type: "join_request",
    title: "New join request",
    description: "Riley Kim wants to join Sunrise Mountain Hike",
    time: "2 hours ago",
    unread: true,
    eventId: "1",
    actionRequired: true,
  },
  {
    id: "3",
    type: "join_request",
    title: "2 new join requests",
    description: "Jordan Lee and Taylor Patel want to join 3-Day Camping Adventure",
    time: "6 hours ago",
    unread: true,
    eventId: "5",
    actionRequired: true,
  },
  {
    id: "4",
    type: "match",
    title: "New event matches your interests!",
    description: "Sunrise Mountain Hike — matches Hiking, Photography",
    time: "1 day ago",
    unread: false,
    eventId: "1",
  },
  {
    id: "5",
    type: "expense",
    title: "New expense added",
    description: "Maya added 'Snacks & drinks' — $32.50 to Weekend Beach Getaway",
    time: "1 day ago",
    unread: false,
    eventId: "2",
  },
  {
    id: "6",
    type: "chat",
    title: "New messages in your circle",
    description: "Riley: I've got sleeping bags covered! — 3-Day Camping Adventure",
    time: "2 days ago",
    unread: false,
    eventId: "5",
  },
  {
    id: "7",
    type: "accepted",
    title: "You've been accepted!",
    description: "Art & Wine Evening — you're in!",
    time: "3 days ago",
    unread: false,
    eventId: "4",
  },
];
