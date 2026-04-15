import { useState } from "react";
import { Settings, LogOut, ChevronRight, Plus, X, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";

const CIRCLE_EMOJIS = ["🎓", "💛", "💼", "💪", "✈️", "🏡", "🎮", "🎵", "🏖️", "☕", "🎯", "🌮"];

const ProfileScreen = () => {
  const { user, logout, circleGroups, addCircleGroup, removeCircleGroup, updateUserInterests, events } = useApp();
  const [showAddCircle, setShowAddCircle] = useState(false);
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleEmoji, setNewCircleEmoji] = useState("🎓");
  const [editingInterests, setEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>([]);

  if (!user) return null;

  const myEvents = events.filter((e) => e.participants.some((p) => p.id === user.id));
  const myCircles = circleGroups.filter((g) => g.createdBy === user.id);

  const handleAddCircle = () => {
    if (!newCircleName.trim()) return;
    addCircleGroup(newCircleName, newCircleEmoji);
    setNewCircleName("");
    setNewCircleEmoji("🎓");
    setShowAddCircle(false);
  };

  const startEditInterests = () => {
    setTempInterests([...user.interests]);
    setEditingInterests(true);
  };

  const toggleInterest = (tag: string) => {
    setTempInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const saveInterests = () => {
    updateUserInterests(tempInterests);
    setEditingInterests(false);
  };

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
            { label: "Events", value: String(myEvents.length) },
            { label: "Circles", value: String(myCircles.length) },
            { label: "Friends", value: "12" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-2xl p-4 text-center shadow-card">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* My Circles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">My Circles</h3>
            <Button
              variant="soft"
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setShowAddCircle(!showAddCircle)}
            >
              {showAddCircle ? <X size={14} /> : <Plus size={14} />}
              {showAddCircle ? "Cancel" : "New"}
            </Button>
          </div>

          {showAddCircle && (
            <div className="p-4 rounded-xl bg-card shadow-card mb-3 space-y-3">
              <Input
                placeholder="Circle name (e.g., Uni Friends)"
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                className="h-10 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
              />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Choose an emoji</p>
                <div className="flex flex-wrap gap-2">
                  {CIRCLE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewCircleEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
                        newCircleEmoji === emoji ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="hero" className="w-full h-10 rounded-xl text-sm font-semibold" onClick={handleAddCircle}>
                Create Circle
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {myCircles.map((group) => (
              <div key={group.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                  {group.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.members.length} members</p>
                </div>
                <button
                  onClick={() => removeCircleGroup(group.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Your Interests</h3>
            <Button
              variant="soft"
              size="sm"
              className="rounded-full text-xs"
              onClick={editingInterests ? saveInterests : startEditInterests}
            >
              {editingInterests ? <Check size={14} /> : <Edit2 size={14} />}
              {editingInterests ? "Save" : "Edit"}
            </Button>
          </div>

          {editingInterests ? (
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    tempInterests.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((tag) => (
                <span key={tag} className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
              {user.interests.length === 0 && (
                <p className="text-sm text-muted-foreground">No interests selected yet</p>
              )}
            </div>
          )}
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
