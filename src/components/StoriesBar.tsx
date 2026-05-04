import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const StoriesBar = () => {
  const { user, stories, createStory } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  // Auto-advance
  useEffect(() => {
    if (viewing === null) return;
    const t = setTimeout(() => {
      if (viewing + 1 < stories.length) setViewing(viewing + 1);
      else setViewing(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [viewing, stories.length]);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await createStory(file);
    setUploading(false);
    e.target.value = "";
  };

  // Group by user
  const byUser = stories.reduce<Record<string, typeof stories>>((acc, s) => {
    (acc[s.userId] ||= []).push(s);
    return acc;
  }, {});
  const groups = Object.values(byUser);

  return (
    <>
      <div className="px-5 pb-3 flex gap-3 overflow-x-auto scrollbar-hide">
        {/* Add story */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 flex flex-col items-center gap-1"
        >
          <div className="relative w-16 h-16 rounded-full gradient-primary p-[2px]">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="me" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-card-foreground">{user?.name?.[0] || "Me"}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
              <Plus size={11} className="text-primary-foreground" />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground">Your Story</span>
        </button>

        {groups.map((g, i) => (
          <button
            key={g[0].userId}
            onClick={() => setViewing(stories.indexOf(g[0]))}
            className="flex-shrink-0 flex flex-col items-center gap-1"
          >
            <div className="w-16 h-16 rounded-full gradient-primary p-[2px]">
              <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
                {g[0].userAvatar ? (
                  <img src={g[0].userAvatar} alt={g[0].userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-card-foreground">{g[0].userName[0]}</span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[64px]">
              {g[0].userName.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />

      {viewing !== null && stories[viewing] && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setViewing(null)}>
          <button className="absolute top-4 right-4 text-white z-10"><X size={28} /></button>
          <div className="absolute top-4 left-4 right-16 flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold">
              {stories[viewing].userName[0]}
            </div>
            <span className="text-white text-sm font-medium">{stories[viewing].userName}</span>
          </div>
          <img src={stories[viewing].imageUrl} alt="story" className="max-h-screen max-w-full object-contain" />
          {stories[viewing].caption && (
            <p className="absolute bottom-10 left-0 right-0 text-center text-white text-sm px-6">
              {stories[viewing].caption}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default StoriesBar;
