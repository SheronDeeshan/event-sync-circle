import { useRef, useState } from "react";
import { Camera, Plus } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import type { EventItem } from "@/lib/mock-data";

const PhotosTab = ({ event }: { event: EventItem }) => {
  const { eventPhotos, uploadEventPhoto } = useApp();
  const photos = eventPhotos[event.id] || [];
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadEventPhoto(event.id, file);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{photos.length} photo{photos.length !== 1 && "s"}</p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-xs font-medium text-primary"
        >
          <Plus size={14} /> {uploading ? "Uploading…" : "Add photo"}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      {photos.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Camera size={36} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos yet — be the first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {photos.map((p) => (
            <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-secondary">
              <img src={p.imageUrl} alt={p.caption || ""} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotosTab;
