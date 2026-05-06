import { MapPin, Calendar, Users, ChevronRight, CalendarRange } from "lucide-react";
import type { EventItem } from "@/lib/mock-data";
import eventHike from "@/assets/event-hike.jpg";
import eventBeach from "@/assets/event-beach.jpg";
import eventMusic from "@/assets/event-music.jpg";
import eventArt from "@/assets/event-art.jpg";

const eventImages: Record<string, string> = {
  "1": eventHike,
  "2": eventBeach,
  "3": eventMusic,
  "4": eventArt,
};

interface EventCardProps {
  event: EventItem;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  const image = event.coverImage || eventImages[event.id] || eventHike;
  const dateObj = new Date(event.date + "T00:00:00");
  const month = dateObj.toLocaleString("en", { month: "short" }).toUpperCase();
  const day = dateObj.getDate();
  const isMultiDay = !!event.endDate;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden shadow-card bg-card transition-transform active:scale-[0.98]"
    >
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center">
          <div className="text-[10px] font-bold text-primary leading-none">{month}</div>
          <div className="text-lg font-bold text-card-foreground leading-tight">{day}</div>
          {isMultiDay && (
            <div className="text-[9px] text-muted-foreground font-medium">
              +{Math.ceil((new Date(event.endDate! + "T00:00:00").getTime() - dateObj.getTime()) / 86400000)}d
            </div>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          {event.privacy === "anonymous" && (
            <div className="bg-accent/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-medium text-accent-foreground">
              Anonymous
            </div>
          )}
          {event.status === "active" && (
            <div className="bg-[hsl(var(--success))]/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--success-foreground))]">
              Active
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-card-foreground text-base mb-1.5">{event.title}</h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
          <MapPin size={12} />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {isMultiDay ? <CalendarRange size={12} /> : <Calendar size={12} />}
              {event.time}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {event.participants.length}/{event.participantLimit}
            </span>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {event.tags.map((tag) => (
            <span key={tag} className="bg-secondary text-secondary-foreground text-[11px] px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

export default EventCard;
