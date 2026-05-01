import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, Users, Clock, Shield, Share2, CalendarRange, Check, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { type EventItem } from "@/lib/mock-data";
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
  const { user, joinEvent, requestJoinEvent, handleJoinRequest, circleGroups, profiles } = useApp();
  const image = eventImages[event.id] || eventHike;
  const isJoined = user ? event.participants.some((p) => p.id === user.id) : false;
  const isFull = event.participants.length >= event.participantLimit;
  const isOrganizer = user?.id === event.organizer.id || (event.organizer.isAnonymous && event.participants[0]?.id === user?.id);
  const hasRequested = user ? event.joinRequests.some((r) => r.userId === user.id && r.status === "pending") : false;
  const pendingRequests = event.joinRequests.filter((r) => r.status === "pending");

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
  const eventCircles = circleGroups.filter((g) => event.circleGroups.includes(g.id));

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    open: "bg-primary/15 text-primary",
    active: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]",
    completed: "bg-secondary text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
  };

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
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize ${statusColors[event.status]}`}>
            {event.status}
          </span>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <Share2 size={18} className="text-foreground" />
          </button>
        </div>
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
          {event.importedFrom && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="text-xs bg-secondary px-2.5 py-1 rounded-full">
                Imported from {event.importedFrom === "facebook" ? "📘 Facebook" : event.importedFrom === "instagram" ? "📸 Instagram" : "📅 Google Calendar"}
              </span>
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

        {/* Join Requests (only visible to organizer) */}
        {isOrganizer && pendingRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-foreground mb-3">
              Join Requests
              <span className="ml-2 text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </h2>
            <div className="space-y-2">
              {pendingRequests.map((req) => {
                const reqUser = profiles.find((u) => u.id === req.userId);
                if (!reqUser) return null;
                return (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                      {reqUser.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{reqUser.name}</p>
                      {req.message && <p className="text-xs text-muted-foreground truncate">"{req.message}"</p>}
                      <p className="text-[11px] text-muted-foreground">{req.requestedAt}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleJoinRequest(event.id, req.id, "approved")}
                        className="w-8 h-8 rounded-full bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] flex items-center justify-center"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleJoinRequest(event.id, req.id, "rejected")}
                        className="w-8 h-8 rounded-full bg-destructive/15 text-destructive flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
          <p className="text-xs text-muted-foreground mt-2">
            {event.participants.map((p) => p.name.split(" ")[0]).join(", ")}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {isJoined ? (
            <Button variant="hero" className="flex-1 h-12 rounded-xl text-base font-semibold" onClick={onJoinSpace}>
              <MessageCircle size={18} />
              Open Circle Space
            </Button>
          ) : hasRequested ? (
            <Button variant="secondary" className="flex-1 h-12 rounded-xl text-base font-semibold" disabled>
              Request Pending...
            </Button>
          ) : (
            <Button
              variant="hero"
              className="flex-1 h-12 rounded-xl text-base font-semibold"
              disabled={isFull}
              onClick={() => {
                if (event.privacy === "public") {
                  joinEvent(event.id);
                } else {
                  requestJoinEvent(event.id);
                }
              }}
            >
              {isFull ? "Event Full" : event.privacy === "public" ? "Join Event" : "Request to Join"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
