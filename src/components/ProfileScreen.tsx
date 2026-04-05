import { Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";

const ProfileScreen = () => {
  const { user, logout } = useApp();
  if (!user) return null;

  return (
    <div className="pb-24 pt-2 animate-fade-in">
      <div className="px-5 flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <button className="text-muted-foreground">
          <Settings size={22} />
        </button>
      </div>

      <div className="px-5">
        {/* Avatar & name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground mb-3">
            {user.name[0]}
          </div>
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Events", value: "3" },
            { label: "Circles", value: "5" },
            { label: "Friends", value: "12" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-2xl p-4 text-center shadow-card">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div className="mb-8">
          <h3 className="font-semibold text-foreground mb-3">Your Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((tag) => (
              <span key={tag} className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-medium">
                {tag}
              </span>
            ))}
            <button className="bg-secondary text-muted-foreground text-xs px-3 py-1.5 rounded-full font-medium">
              + Add more
            </button>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-1 mb-8">
          {["Privacy Settings", "Notification Preferences", "Help & Support", "About Circle"].map((item) => (
            <button
              key={item}
              className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary transition-colors"
            >
              <span className="text-sm text-foreground">{item}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button variant="outline" className="w-full h-12 rounded-xl text-destructive border-destructive/20" onClick={logout}>
          <LogOut size={16} />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileScreen;
