import { Users, MapPin, Calendar, MessageCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { type EventItem } from "@/lib/mock-data";

interface JoinedSpacesProps {
  onOpenSpace: (eventId: string) => void;
}

const JoinedSpaces = ({ onOpenSpace }: JoinedSpacesProps) => {
  const { user, events } = useApp();
  if (!user) return null;

  const joined = events.filter((e) => e.participants.some((p) => p.id === user.id));
  const today = new Date().toISOString().slice(0, 10);
  const active = joined.filter((e) => (e.endDate || e.date) >= today);
  const past = joined.filter((e) => (e.endDate || e.date) < today);

  const Card = ({ event }: { event: EventItem }) => (
    <button
      onClick={() => onOpenSpace(event.id)}
      className="w-full text-left p-4 rounded-2xl bg-card shadow-card flex items-center gap-3 hover:bg-secondary/40 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0 flex items-center justify-center">
        {event.coverImage ? (
          <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <MessageCircle size={20} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-card-foreground truncate">{event.title}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1"><Calendar size={11} />{event.date}</span>
          <span className="flex items-center gap-1 truncate"><MapPin size={11} />{event.isOnline ? "Online" : event.location}</span>
        </div>
        <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
          <Users size={11} />{event.participants.length} members
        </p>
      </div>
    </button>
  );

  return (
    <div className="pb-24 pt-2 animate-fade-in">
      <div className="px-5 mb-5">
        <h1 className="text-2xl font-bold text-foreground">Joined</h1>
        <p className="text-sm text-muted-foreground mt-1">Open any circle space you've joined</p>
      </div>

      {joined.length === 0 ? (
        <div className="px-5 text-center py-16 text-muted-foreground">
          <Users size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-lg mb-1">No joined events yet</p>
          <p className="text-sm">Join an event from Home or Discover.</p>
        </div>
      ) : (
        <div className="px-5 space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Active</h2>
              <div className="space-y-3">
                {active.map((e) => <Card key={e.id} event={e} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Past</h2>
              <div className="space-y-3 opacity-80">
                {past.map((e) => <Card key={e.id} event={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinedSpaces;
