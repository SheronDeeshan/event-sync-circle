import { useState } from "react";
import { Bell, Plus, X, AlertTriangle, Calendar, MapPin, Bus, CloudRain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import type { EventItem } from "@/lib/mock-data";

const ICONS: Record<string, any> = {
  date_change: Calendar,
  location_change: MapPin,
  transport: Bus,
  weather: CloudRain,
  general: AlertTriangle,
};

const KIND_LABELS: Record<string, string> = {
  date_change: "Date change",
  location_change: "Location change",
  transport: "Transport",
  weather: "Weather alert",
  general: "General",
};

const EventAlertsPanel = ({ event, isOrganizer }: { event: EventItem; isOrganizer: boolean }) => {
  const { eventAlerts, createEventAlert } = useApp();
  const alerts = eventAlerts[event.id] || [];
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submit = async () => {
    if (!title.trim()) return;
    await createEventAlert(event.id, kind as any, title, body);
    setTitle(""); setBody(""); setKind("general"); setOpen(false);
  };

  if (alerts.length === 0 && !isOrganizer) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Bell size={16} className="text-primary" /> Alerts
        </h2>
        {isOrganizer && (
          <button onClick={() => setOpen(true)} className="text-xs text-primary font-medium flex items-center gap-1">
            <Plus size={14} /> Post alert
          </button>
        )}
      </div>
      <div className="space-y-2">
        {alerts.length === 0 && (
          <p className="text-xs text-muted-foreground">No alerts yet.</p>
        )}
        {alerts.map((a) => {
          const Icon = ICONS[a.kind] || AlertTriangle;
          return (
            <div key={a.id} className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex gap-3">
              <Icon size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                {a.body && <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  {KIND_LABELS[a.kind]} · {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg bg-card rounded-t-2xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Post Alert</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(KIND_LABELS).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKind(k)}
                    className={`py-2 rounded-xl text-xs font-medium ${
                      kind === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {KIND_LABELS[k]}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Title (e.g., Date moved to Saturday)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0"
              />
              <textarea
                placeholder="Details (optional)"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-20 rounded-xl bg-secondary border-0 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="hero" className="w-full h-11 rounded-xl" onClick={submit}>
                Post Alert to Participants
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAlertsPanel;
