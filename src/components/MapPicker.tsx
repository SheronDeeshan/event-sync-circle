import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MapPickerProps {
  value: string;
  lat?: number | null;
  lng?: number | null;
  onChange: (location: string, lat?: number, lng?: number) => void;
}

declare global {
  interface Window { google?: any; __gmapsLoading?: Promise<void> }
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

const loadGoogleMaps = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;
  if (!apiKey) return Promise.reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
  window.__gmapsLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoading;
};

const MapPicker = ({ value, lat, lng, onChange }: MapPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || !window.google?.maps?.places) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "geometry", "name"],
    });
    const listener = ac.addListener("place_changed", () => {
      const p = ac.getPlace();
      const loc = p.formatted_address || p.name || inputRef.current!.value;
      const latVal = p.geometry?.location?.lat?.();
      const lngVal = p.geometry?.location?.lng?.();
      onChange(loc, latVal, lngVal);
    });
    return () => { listener?.remove?.(); };
  }, [ready, onChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={ready ? "Search places…" : "Where is it happening?"}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value, undefined, undefined)}
          className="h-12 rounded-xl bg-secondary border-0 pl-10 text-foreground placeholder:text-muted-foreground"
        />
      </div>
      {error && (
        <p className="text-xs text-muted-foreground">
          <MapPin size={11} className="inline mr-1" />Maps unavailable — type address manually.
        </p>
      )}
      {lat && lng && apiKey && (
        <iframe
          title="Selected location"
          className="w-full h-32 rounded-xl border-0"
          src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=14`}
        />
      )}
    </div>
  );
};

export default MapPicker;
