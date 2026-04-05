import { useState } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";

interface CreateEventProps {
  onBack: () => void;
  onCreated: () => void;
}

const CreateEvent = ({ onBack, onCreated }: CreateEventProps) => {
  const { user } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [limit, setLimit] = useState("10");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<"public" | "private" | "anonymous">("public");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCreate = () => {
    if (!title || !description || !location || !date) return;
    // In real app, this would save to DB
    onCreated();
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Create Event</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Cover image placeholder */}
        <div className="w-full h-40 rounded-2xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center">
          <Camera size={28} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Add cover photo</p>
        </div>

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
            <label className="text-sm font-medium text-foreground mb-1.5 block">Location</label>
            <Input
              placeholder="Where is it happening?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground"
              />
            </div>
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

          {/* Interest tags */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
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
