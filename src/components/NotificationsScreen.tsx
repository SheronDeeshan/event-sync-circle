import { Bell, UserPlus, Check, Star } from "lucide-react";

const notifications = [
  {
    id: "1",
    type: "match",
    icon: Star,
    title: "New event matches your interests!",
    description: "Sunrise Mountain Hike — matches Hiking, Photography",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "invite",
    icon: UserPlus,
    title: "Maya invited you",
    description: "Weekend Beach Getaway — Apr 18",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    type: "accepted",
    icon: Check,
    title: "You've been accepted!",
    description: "Art & Wine Evening — you're in!",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "4",
    type: "match",
    icon: Star,
    title: "Trending near you",
    description: "Secret Rooftop Jam Session — 20 spots left",
    time: "Yesterday",
    unread: false,
  },
];

const NotificationsScreen = () => {
  return (
    <div className="pb-24 pt-2 animate-fade-in">
      <div className="px-5 mb-5">
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
      </div>

      <div className="px-5 space-y-2">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl transition-colors ${
                n.unread ? "bg-primary/5" : "bg-card"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.unread ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.unread ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsScreen;
