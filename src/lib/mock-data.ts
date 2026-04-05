export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  interests: string[];
  isAnonymous: boolean;
}

export interface CircleGroup {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
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
  status: "upcoming" | "active" | "completed";
  anonymousInvites: string[];
  importedFrom?: "facebook" | "instagram" | "google" | null;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  date: string;
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

export const mockCircleGroups: CircleGroup[] = [
  { id: "cg1", name: "Uni Friends", emoji: "🎓", memberCount: 12 },
  { id: "cg2", name: "Uni Close Friends", emoji: "💛", memberCount: 5 },
  { id: "cg3", name: "ABC Company Friends", emoji: "💼", memberCount: 8 },
  { id: "cg4", name: "Gym Crew", emoji: "💪", memberCount: 6 },
  { id: "cg5", name: "Travel Buddies", emoji: "✈️", memberCount: 4 },
  { id: "cg6", name: "Neighborhood Pals", emoji: "🏡", memberCount: 9 },
];

export const mockUsers: User[] = [
  { id: "1", name: "Alex Chen", email: "alex@circle.app", avatar: "", interests: ["🥾 Hiking", "📸 Photography", "🏕️ Camping"], isAnonymous: false },
  { id: "2", name: "Maya Johnson", email: "maya@circle.app", avatar: "", interests: ["✈️ Travel", "🍳 Cooking", "🎨 Art"], isAnonymous: false },
  { id: "3", name: "Sam Rivera", email: "sam@circle.app", avatar: "", interests: ["⚽ Sports", "🚴 Cycling", "🥾 Hiking"], isAnonymous: false },
  { id: "4", name: "Jordan Lee", email: "jordan@circle.app", avatar: "", interests: ["🎵 Music", "💃 Dancing", "🎬 Movies"], isAnonymous: false },
  { id: "5", name: "Anonymous Organizer", email: "", avatar: "", interests: [], isAnonymous: true },
];

export const currentUser = mockUsers[0];

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
    participantLimit: 12,
    participants: [mockUsers[0], mockUsers[2]],
    organizer: mockUsers[2],
    privacy: "public",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Weekend Beach Getaway",
    description: "A relaxing weekend trip to Malibu with surfing, bonfires, and great company. All skill levels welcome!",
    location: "Malibu Beach, California",
    date: "2026-04-18",
    time: "10:00 AM",
    coverImage: "",
    tags: ["✈️ Travel", "🏄 Surfing"],
    participantLimit: 8,
    participants: [mockUsers[1], mockUsers[3]],
    organizer: mockUsers[1],
    privacy: "public",
    status: "upcoming",
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
    participantLimit: 20,
    participants: [mockUsers[3]],
    organizer: mockUsers[4],
    privacy: "anonymous",
    status: "upcoming",
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
    participantLimit: 15,
    participants: [mockUsers[1]],
    organizer: mockUsers[1],
    privacy: "public",
    status: "upcoming",
  },
];

export const mockMessages: Message[] = [
  { id: "1", senderId: "2", senderName: "Maya", senderAvatar: "", content: "Hey everyone! So excited for this trip! 🎉", timestamp: "10:30 AM" },
  { id: "2", senderId: "3", senderName: "Sam", senderAvatar: "", content: "Should we carpool? I can drive 3 people", timestamp: "10:45 AM" },
  { id: "3", senderId: "1", senderName: "Alex", senderAvatar: "", content: "That would be great! I'll bring my camera gear 📸", timestamp: "11:00 AM" },
  { id: "4", senderId: "4", senderName: "Jordan", senderAvatar: "", content: "Don't forget sunscreen! The forecast looks sunny ☀️", timestamp: "11:15 AM" },
  { id: "5", senderId: "2", senderName: "Maya", senderAvatar: "", content: "I'll prepare some snacks for the group", timestamp: "11:30 AM" },
];

export const mockExpenses: Expense[] = [
  { id: "1", title: "Gas for road trip", amount: 45.00, paidBy: "Sam Rivera", splitAmong: ["1", "2", "3"], date: "Apr 10" },
  { id: "2", title: "Snacks & drinks", amount: 32.50, paidBy: "Maya Johnson", splitAmong: ["1", "2", "3", "4"], date: "Apr 11" },
  { id: "3", title: "Campsite booking", amount: 80.00, paidBy: "Alex Chen", splitAmong: ["1", "2", "3", "4"], date: "Apr 9" },
];
