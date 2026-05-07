import { Home, Users, PlusCircle, Bell, User } from "lucide-react";

interface BottomNavProps {
  active: string;
  onNavigate: (tab: string) => void;
  unreadNotifications?: number;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "joined", icon: Users, label: "Joined" },
  { id: "create", icon: PlusCircle, label: "Create" },
  { id: "notifications", icon: Bell, label: "Alerts" },
  { id: "profile", icon: User, label: "Profile" },
];

const BottomNav = ({ active, onNavigate, unreadNotifications = 0 }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          const isCreate = id === "create";
          const showBadge = id === "notifications" && unreadNotifications > 0;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`relative flex flex-col items-center gap-0.5 transition-colors ${
                isCreate
                  ? "text-primary"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={isCreate ? 28 : 22} strokeWidth={isActive ? 2.5 : 1.5} />
              {showBadge && (
                <div className="absolute -top-0.5 right-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[9px] font-bold text-primary-foreground">{unreadNotifications}</span>
                </div>
              )}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
