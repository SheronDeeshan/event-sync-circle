import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { type EventItem } from "@/lib/mock-data";

interface Props {
  event: EventItem;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const EditEventDialog = ({ event, open, onOpenChange }: Props) => {
  const { updateEvent, circleGroups } = useApp();
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time);
  const [isOnline, setIsOnline] = useState(!!event.isOnline);
  const [onlineUrl, setOnlineUrl] = useState(event.onlineUrl || "");
  const [selectedCircles, setSelectedCircles] = useState<string[]>(event.circleGroups);

  const save = async () => {
    const ok = await updateEvent(event.id, {
      title, description, date, time,
      location: isOnline ? "Online" : location,
      isOnline, onlineUrl: isOnline ? onlineUrl : "",
      circleGroups: selectedCircles,
    });
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-11 rounded-xl bg-secondary border-0" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" className="rounded-xl bg-secondary border-0" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{isOnline ? "Online" : "In person"}</span>
            <button onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${isOnline ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {isOnline ? "🌐 Online" : "📍 In person"}
            </button>
          </div>
          {isOnline ? (
            <Input value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="Meeting link" className="h-11 rounded-xl bg-secondary border-0" />
          ) : (
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="h-11 rounded-xl bg-secondary border-0" />
          )}
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 rounded-xl bg-secondary border-0" />
          </div>
          {circleGroups.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Circles</p>
              <div className="flex flex-wrap gap-2">
                {circleGroups.map((g) => (
                  <button key={g.id}
                    onClick={() => setSelectedCircles((p) => p.includes(g.id) ? p.filter((c) => c !== g.id) : [...p, g.id])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${selectedCircles.includes(g.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {g.emoji} {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button variant="hero" className="w-full h-11 rounded-xl" onClick={save}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventDialog;
