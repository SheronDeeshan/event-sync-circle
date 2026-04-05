import { ArrowLeft, MapPin, Calendar, Users, Clock, Shield, Share2, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { mockCircleGroups, type EventItem } from "@/lib/mock-data";
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

interface EventDetailProps {
  event: EventItem;
  onBack: () => void;
  onJoinSpace: () => void;
}

const EventDetail = ({ event, onBack, onJoinSpace }: EventDetailProps) => {
  const { user, joinEvent } = useApp();
  const image = eventImages[event.id] || eventHike;
  const isJoined = user ? event.participants.some((p) => p.id === user.id) : false;
  const isFull = event.participants.length >= event.participantLimit;

  const dateObj = new Date(event.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const endDateStr = event.endDate
    ? new Date(event.endDate + "T00:00:00").toLocaleDateString("en", { month: "long", day: "numeric" })
    : null;
  const eventCircles = mockCircleGroups.filter((g) => event.circleGroups.includes(g.id));

  return (
    <div className="pb-24 animate-fade-in">
      {/* Hero image */}
      <div className="relative h-64">
        <img src={image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center">
          <Share2 size={18} className="text-foreground" />
        </button>
      </div>

      <div className="px-5 -mt-8 relative z-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {event.tags.map((tag) => (
            <span key={tag} className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">{event.title}</h1>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {endDateStr ? <CalendarRange size={16} className="text-primary" /> : <Calendar size={16} className="text-primary" />}
            <span>{formattedDate}{endDateStr ? ` — ${endDateStr}` : ""}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock size={16} className="text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin size={16} className="text-primary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users size={16} className="text-primary" />
            <span>{event.participants.length} / {event.participantLimit} joined</span>
          </div>
          {event.privacy === "anonymous" && (
            <div className="flex items-center gap-3 text-sm text-accent">
              <Shield size={16} />
              <span>Anonymous event — organizer identity hidden</span>
            </div>
          )}
          {eventCircles.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users size={16} className="text-primary" />
              <div className="flex flex-wrap gap-1.5">
                {eventCircles.map((g) => (
                  <span key={g.id} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {g.emoji} {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-2">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        {/* Organizer */}
        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-3">Organizer</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {event.organizer.isAnonymous ? "?" : event.organizer.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {event.organizer.isAnonymous ? "Anonymous" : event.organizer.name}
              </p>
              <p className="text-xs text-muted-foreground">Event Organizer</p>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-8">
          <h2 className="font-semibold text-foreground mb-3">Participants</h2>
          <div className="flex -space-x-2">
            {event.participants.map((p, i) => (
              <div
                key={p.id}
                className="w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-semibold text-secondary-foreground"
                style={{ zIndex: event.participants.length - i }}
              >
                {p.name[0]}
              </div>
            ))}
            {event.participants.length < event.participantLimit && (
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-xs text-muted-foreground">
                +
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {isJoined ? (
            <Button variant="hero" className="flex-1 h-12 rounded-xl text-base font-semibold" onClick={onJoinSpace}>
              Open Circle Space
            </Button>
          ) : (
            <Button
              variant="hero"
              className="flex-1 h-12 rounded-xl text-base font-semibold"
              disabled={isFull}
              onClick={() => joinEvent(event.id)}
            >
              {isFull ? "Event Full" : "Request to Join"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
