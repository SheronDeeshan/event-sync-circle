import { Compass } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";
import EventCard from "@/components/EventCard";

interface HomeFeedProps {
  onEventClick: (eventId: string) => void;
  onDiscover?: () => void;
}

const HomeFeed = ({ onEventClick, onDiscover }: HomeFeedProps) => {
  const { user, events, circleGroups, selectedInterests, setSelectedInterests } = useApp();

  const toggleInterest = (tag: string) => {
    setSelectedInterests(
      selectedInterests.includes(tag)
        ? selectedInterests.filter((t) => t !== tag)
        : [...selectedInterests, tag]
    );
  };

  // Newest-created first
  const sortedEvents = [...events].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );

  const filteredEvents =
    selectedInterests.length === 0
      ? sortedEvents
      : sortedEvents.filter((e) => e.tags.some((t) => selectedInterests.includes(t)));

  const recommendedEvents = user
    ? sortedEvents.filter((e) => e.tags.some((t) => user.interests.includes(t)))
    : [];

  // Group events by circle
  const eventsByCircle = circleGroups.map((g) => ({
    group: g,
    events: sortedEvents.filter((e) => e.circleGroups.includes(g.id)),
  })).filter((c) => c.events.length > 0);

  return (
    <div className="pb-24 pt-2">
      <div className="px-5 mb-5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">
            Hey, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your circle, your events</p>
        </div>
        {onDiscover && (
          <button
            onClick={onDiscover}
            aria-label="Discover events"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            <Compass size={14} />
            Discover
          </button>
        )}
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

      {/* By Circle */}
      {eventsByCircle.length > 0 && selectedInterests.length === 0 && (
        <div className="px-5 mb-6 space-y-5">
          {eventsByCircle.map(({ group, events: circleEvents }) => (
            <div key={group.id}>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>{group.emoji}</span>
                <span>{group.name}</span>
                <span className="text-xs text-muted-foreground font-normal">({circleEvents.length})</span>
              </h2>
              <div className="space-y-4">
                {circleEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


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
