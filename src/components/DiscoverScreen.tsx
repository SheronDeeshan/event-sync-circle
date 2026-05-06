import { useState } from "react";
import { Search, MapPin, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";
import EventCard from "@/components/EventCard";

interface DiscoverScreenProps {
  onEventClick: (eventId: string) => void;
}

const DiscoverScreen = ({ onEventClick }: DiscoverScreenProps) => {
  const { events, user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Sort by newest created
  const allSorted = [...events].sort((a, b) =>
    (b.createdAt || "").localeCompare(a.createdAt || "")
  );

  // Simple matching: score events by shared interests
  const scoredEvents = allSorted.map((event) => {
    const sharedInterests = user
      ? event.tags.filter((t) => user.interests.includes(t)).length
      : 0;
    return { event, score: sharedInterests };
  });

  // Filter and sort
  let filtered = scoredEvents;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      ({ event }) =>
        event.title.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q) ||
        event.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (activeFilter) {
    filtered = filtered.filter(({ event }) => event.tags.includes(activeFilter));
  }

  // Sort by match score descending
  filtered.sort((a, b) => b.score - a.score);

  const trendingEvents = [...events].sort((a, b) => b.participants.length - a.participants.length).slice(0, 3);

  return (
    <div className="pb-24 pt-2 animate-fade-in">
      <div className="px-5 mb-5">
        <h1 className="text-2xl font-bold text-foreground">Discover</h1>
        <p className="text-sm text-muted-foreground mt-1">Find events matched to your interests</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events, locations, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            All
          </button>
          {INTEREST_TAGS.slice(0, 10).map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === tag ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Trending section */}
      {!searchQuery && !activeFilter && (
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Trending</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {trendingEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="flex-shrink-0 w-48 rounded-xl bg-card shadow-card overflow-hidden text-left"
              >
                <div className="p-3">
                  <p className="text-sm font-semibold text-card-foreground line-clamp-1">{event.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin size={10} />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mt-1.5">
                    {event.participants.length} joined
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          {searchQuery || activeFilter ? "Results" : "For You"}
          {user && !searchQuery && !activeFilter && (
            <span className="text-xs text-muted-foreground font-normal ml-2">Based on your interests</span>
          )}
        </h2>
        <div className="space-y-4">
          {filtered.map(({ event, score }) => (
            <div key={event.id} className="relative">
              {score > 0 && !searchQuery && (
                <div className="absolute -top-1 right-3 z-10 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {score} interest{score > 1 ? "s" : ""} match
                </div>
              )}
              <EventCard event={event} onClick={() => onEventClick(event.id)} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-lg mb-1">No events found</p>
              <p className="text-sm">Try different keywords or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverScreen;
