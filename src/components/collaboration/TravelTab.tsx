import { Car, Train, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventItem } from "@/lib/mock-data";

interface TravelTabProps {
  event: EventItem;
}

const TravelTab = ({ event }: TravelTabProps) => {
  return (
    <div className="px-5 py-5 space-y-5 pb-24">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Getting There</h3>
        <p className="text-sm text-muted-foreground mb-4">{event.location}</p>
      </div>

      {/* Route options */}
      {[
        { icon: Car, mode: "Drive", time: "45 min", distance: "28 miles", color: "text-primary" },
        { icon: Train, mode: "Transit", time: "1h 15min", distance: "2 transfers", color: "text-accent" },
        { icon: Footprints, mode: "Walk", time: "5h 30min", distance: "18 miles", color: "text-[hsl(var(--success))]" },
      ].map(({ icon: Icon, mode, time, distance, color }) => (
        <div key={mode} className="flex items-center gap-4 p-4 rounded-xl bg-card shadow-card">
          <div className={`w-11 h-11 rounded-full bg-secondary flex items-center justify-center ${color}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-card-foreground text-sm">{mode}</p>
            <p className="text-xs text-muted-foreground">{distance}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-card-foreground text-sm">{time}</p>
            <p className="text-xs text-muted-foreground">est.</p>
          </div>
        </div>
      ))}

      {/* Carpool section */}
      <div className="mt-2">
        <h3 className="font-semibold text-foreground mb-3">Carpool</h3>
        <div className="p-4 rounded-xl border border-dashed border-border text-center">
          <Car size={24} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No carpool offers yet</p>
          <Button variant="soft" size="sm" className="mt-3 rounded-full text-xs">
            Offer a Ride
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelTab;
