import { Compass } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";
import EventCard from "@/components/EventCard";

interface HomeFeedProps {
  onEventClick: (eventId: string) => void;
  onDiscover?: () => void;
}

const HomeFeed = ({ onEventClick }: HomeFeedProps) => {
  const { user, events, selectedInterests, setSelectedInterests } = useApp();

  const toggleInterest = (tag: string) => {
    setSelectedInterests(
      selectedInterests.includes(tag)
        ? selectedInterests.filter((t) => t !== tag)
        : [...selectedInterests, tag]
    );
  };

  const filteredEvents =
    selectedInterests.length === 0
      ? events
      : events.filter((e) => e.tags.some((t) => selectedInterests.includes(t)));

  const recommendedEvents = user
    ? events.filter((e) => e.tags.some((t) => user.interests.includes(t)))
    : [];

  return (
    <div className="pb-24 pt-2">
      <div className="px-5 mb-5">
        <h1 className="text-2xl font-bold text-foreground">
          Hey, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Discover events that match your vibe</p>
      </div>

      {/* Interest filter chips */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {INTEREST_TAGS.slice(0, 8).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleInterest(tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedInterests.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended for you */}
      {recommendedEvents.length > 0 && selectedInterests.length === 0 && (
        <div className="px-5 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Recommended for you</h2>
          <div className="space-y-4">
            {recommendedEvents.slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
            ))}
          </div>
        </div>
      )}

      {/* All events */}
      <div className="px-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {selectedInterests.length > 0 ? "Matching Events" : "All Events"}
        </h2>
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-1">No events found</p>
              <p className="text-sm">Try different interests or create your own!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
