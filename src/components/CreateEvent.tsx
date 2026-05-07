import { useRef, useState } from "react";
import { ArrowLeft, Camera, X, Upload, Users, UserPlus, CalendarRange, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import MapPicker from "@/components/MapPicker";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateEventProps {
  onBack: () => void;
  onCreated: () => void;
}

const IMPORT_SOURCES = [
  { id: "facebook", label: "Facebook", emoji: "📘" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "google", label: "Google Calendar", emoji: "📅" },
];

const CreateEvent = ({ onBack, onCreated }: CreateEventProps) => {
  const { user, circleGroups, createEvent, profiles } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [time, setTime] = useState("");
  const [limit, setLimit] = useState("10");
  const [transportInfo, setTransportInfo] = useState("");
  const [weatherAlerts, setWeatherAlerts] = useState(false);
  const [privateRule, setPrivateRule] = useState<"any" | "all">("any");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<"public" | "private" | "anonymous">("public");
  const [anonymousInvites, setAnonymousInvites] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [coverImage, setCoverImage] = useState<string>("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [onlineUrl, setOnlineUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingCover(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("event-photos").upload(path, file);
    if (error) {
      toast.error(error.message);
      setUploadingCover(false);
      return;
    }
    const url = supabase.storage.from("event-photos").getPublicUrl(path).data.publicUrl;
    setCoverImage(url);
    setUploadingCover(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCircle = (id: string) => {
    setSelectedCircles((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleAnonymousInvite = (userId: string) => {
    setAnonymousInvites((prev) =>
      prev.includes(userId) ? prev.filter((u) => u !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!title || !description || !date) return;
    if (!isOnline && !location) return;
    if (isOnline && !onlineUrl) return;
    const created = await createEvent({
      title,
      description,
      location: isOnline ? "Online" : location,
      latitude: isOnline ? null : (lat ?? null),
      longitude: isOnline ? null : (lng ?? null),
      date,
      endDate: isMultiDay ? endDate : undefined,
      time,
      coverImage,
      tags: selectedTags,
      circleGroups: selectedCircles,
      participantLimit: parseInt(limit) || 10,
      privacy,
      privateRule,
      transportInfo: transportInfo || undefined,
      weatherAlertsEnabled: weatherAlerts,
      anonymousInvites,
      isOnline,
      onlineUrl: isOnline ? onlineUrl : undefined,
      importedFrom: null,
    });
    if (created) onCreated();
  };

  const handleImport = (source: string) => {
    setShowImportModal(false);
    // Placeholder: in real app, would open OAuth flow / import UI
  };

  const invitableUsers = profiles.filter((u) => u.id !== user?.id && !u.isAnonymous);

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-foreground flex-1">Create Event</h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
        >
          <Upload size={14} />
          Import
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowImportModal(false)}>
          <div className="w-full max-w-lg bg-card rounded-t-2xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Import Event From</h3>
              <button onClick={() => setShowImportModal(false)} className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {IMPORT_SOURCES.map((src) => (
                <button
                  key={src.id}
                  onClick={() => handleImport(src.id)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-xl">{src.emoji}</span>
                  <span className="text-sm font-medium text-secondary-foreground">{src.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Connect your account to import event details automatically
            </p>
          </div>
        </div>
      )}

      <div className="px-5 space-y-5">
        {/* Cover image */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden relative"
        >
          {coverImage ? (
            <img src={coverImage} alt="Event cover" className="w-full h-full object-cover" />
          ) : (
            <>
              <Camera size={28} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{uploadingCover ? "Uploading…" : "Add cover photo"}</p>
            </>
          )}
        </button>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Event Title</label>
            <Input
              placeholder="e.g., Sunrise Mountain Hike"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
            <textarea
              placeholder="Tell people what this event is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 rounded-xl bg-secondary border-0 px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">{isOnline ? "Meeting link" : "Location"}</label>
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isOnline ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {isOnline ? "🌐 Online" : "📍 In person"}
              </button>
            </div>
            {isOnline ? (
              <Input
                placeholder="https://zoom.us/j/… or Meet/Discord link"
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
              />
            ) : (
              <MapPicker
                value={location}
                lat={lat}
                lng={lng}
                onChange={(loc, la, lo) => { setLocation(loc); setLat(la); setLng(lo); }}
              />
            )}
          </div>

          {/* Multi-day toggle + dates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <button
                onClick={() => setIsMultiDay(!isMultiDay)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isMultiDay ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <CalendarRange size={12} />
                Multi-day
              </button>
            </div>
            <div className={`grid gap-3 ${isMultiDay ? "grid-cols-2" : "grid-cols-1"}`}>
              <div>
                {isMultiDay && <p className="text-xs text-muted-foreground mb-1">Start</p>}
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 rounded-xl bg-secondary border-0 text-foreground"
                />
              </div>
              {isMultiDay && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">End</p>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={date}
                    className="h-12 rounded-xl bg-secondary border-0 text-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Max Participants</label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground"
              />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Privacy</label>
            <div className="flex gap-2">
              {(["public", "private", "anonymous"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrivacy(p)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-colors ${
                    privacy === p
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Circle Groups */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
              <Users size={14} className="text-primary" />
              Share with Circles
            </label>
            <p className="text-xs text-muted-foreground mb-2">Tag your friend groups to notify them</p>
            <div className="flex flex-wrap gap-2">
              {circleGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => toggleCircle(group.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    selectedCircles.includes(group.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span>{group.emoji}</span>
                  <span>{group.name}</span>
                  <span className="opacity-60">({group.members.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous Invites */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
              <UserPlus size={14} className="text-accent" />
              Anonymous Invites
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Invite people without revealing who suggested them
            </p>
            <div className="space-y-2">
              {invitableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleAnonymousInvite(u.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    anonymousInvites.includes(u.id)
                      ? "bg-accent/15 border border-accent/30"
                      : "bg-secondary"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {u.name[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.interests.slice(0, 2).join(", ")}</p>
                  </div>
                  {anonymousInvites.includes(u.id) && (
                    <span className="text-xs text-accent font-medium">Invited</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Interest tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {INTEREST_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.filter((t) => !INTEREST_TAGS.includes(t)).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground inline-flex items-center gap-1"
                >
                  {tag}
                  <X size={10} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag (e.g. 🌮 Tacos)"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const t = customTag.trim();
                    if (t && !selectedTags.includes(t)) setSelectedTags([...selectedTags, t]);
                    setCustomTag("");
                  }
                }}
                className="h-10 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const t = customTag.trim();
                  if (t && !selectedTags.includes(t)) setSelectedTags([...selectedTags, t]);
                  setCustomTag("");
                }}
                className="h-10 rounded-xl"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <Button variant="hero" className="w-full h-12 rounded-xl text-base font-semibold" onClick={handleCreate}>
          Create Event
        </Button>
      </div>
    </div>
  );
};

export default CreateEvent;
