import { useRef, useState } from "react";
import { Settings, LogOut, ChevronRight, Plus, X, Trash2, Edit2, Check, Camera, UserPlus, Share2, Mail, MessageCircle, Phone, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import { INTEREST_TAGS } from "@/lib/mock-data";
import { toast } from "sonner";

const CIRCLE_EMOJIS = ["🎓", "💛", "💼", "💪", "✈️", "🏡", "🎮", "🎵", "🏖️", "☕", "🎯", "🌮"];

const ProfileScreen = () => {
  const {
    user, logout, circleGroups, addCircleGroup, removeCircleGroup,
    updateUserInterests, events, profiles,
    updateUserProfile, uploadAvatar,
    updateCircleGroup, uploadCircleAvatar,
    addCircleMember, removeCircleMember, createCircleInvite,
  } = useApp();

  const [showAddCircle, setShowAddCircle] = useState(false);
  const [newCircleName, setNewCircleName] = useState("");
  const [newCircleEmoji, setNewCircleEmoji] = useState("🎓");
  const [newCircleDesc, setNewCircleDesc] = useState("");
  const [newCircleAvatar, setNewCircleAvatar] = useState("");
  const [circleSearch, setCircleSearch] = useState("");
  const [editingInterests, setEditingInterests] = useState(false);
  const [tempInterests, setTempInterests] = useState<string[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [manageCircleId, setManageCircleId] = useState<string | null>(null);
  const [editCircleDesc, setEditCircleDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const circleAvatarRef = useRef<HTMLInputElement>(null);
  const editCircleAvatarRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const myEvents = events.filter((e) => e.participants.some((p) => p.id === user.id));
  const myCircles = circleGroups.filter((g) => g.createdBy === user.id);
  const manageCircle = circleGroups.find((c) => c.id === manageCircleId);

  const handleAddCircle = async () => {
    if (!newCircleName.trim()) return;
    await addCircleGroup(newCircleName, newCircleEmoji, newCircleDesc || undefined, newCircleAvatar || undefined);
    setNewCircleName("");
    setNewCircleEmoji("🎓");
    setNewCircleDesc("");
    setNewCircleAvatar("");
    setShowAddCircle(false);
  };

  const handleNewCircleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await uploadCircleAvatar(f);
    if (url) setNewCircleAvatar(url);
    e.target.value = "";
  };

  const handleEditCircleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !manageCircle) return;
    const url = await uploadCircleAvatar(f);
    if (url) await updateCircleGroup(manageCircle.id, { avatarUrl: url });
    e.target.value = "";
  };

  const saveCircleDesc = async () => {
    if (!manageCircle) return;
    await updateCircleGroup(manageCircle.id, { description: editCircleDesc });
  };

  const startEditInterests = () => {
    setTempInterests([...user.interests]);
    setEditingInterests(true);
  };
  const toggleInterest = (tag: string) => {
    setTempInterests((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);
  };
  const saveInterests = () => {
    updateUserInterests(tempInterests);
    setEditingInterests(false);
  };

  const startEditProfile = () => {
    setEditName(user.name);
    setEditBio(user.bio || "");
    setEditingProfile(true);
  };
  const saveProfile = async () => {
    await updateUserProfile({ name: editName, bio: editBio });
    setEditingProfile(false);
  };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadAvatar(file);
    if (url) await updateUserProfile({ avatar: url });
    e.target.value = "";
  };

  const buildShare = async (channel: "copy" | "whatsapp" | "sms" | "email") => {
    if (!manageCircle) return;
    const link = await createCircleInvite(manageCircle.id, {
      email: channel === "email" ? inviteEmail || undefined : undefined,
      phone: channel === "sms" || channel === "whatsapp" ? invitePhone || undefined : undefined,
    });
    if (!link) return;
    const text = `Join my "${manageCircle.name}" circle on Circle: ${link}`;
    if (channel === "copy") {
      await navigator.clipboard.writeText(link);
      toast.success("Invite link copied");
    } else if (channel === "whatsapp") {
      window.open(`https://wa.me/${invitePhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (channel === "sms") {
      window.location.href = `sms:${invitePhone}?&body=${encodeURIComponent(text)}`;
    } else if (channel === "email") {
      window.location.href = `mailto:${inviteEmail}?subject=${encodeURIComponent("Join my Circle")}&body=${encodeURIComponent(text)}`;
    }
  };

  const memberCandidates = profiles.filter((p) =>
    p.id !== user.id &&
    !manageCircle?.members.includes(p.id) &&
    (memberSearch ? p.name.toLowerCase().includes(memberSearch.toLowerCase()) : true)
  ).slice(0, 8);

  return (
    <div className="pb-24 pt-2 animate-fade-in">
      <div className="px-5 flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <button className="text-muted-foreground"><Settings size={22} /></button>
      </div>

      <div className="px-5">
        {/* Avatar & name */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated"
              aria-label="Change avatar"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarPick} />
          </div>
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.bio && <p className="text-sm text-foreground/80 text-center mt-2 max-w-xs">{user.bio}</p>}
          <Button variant="soft" size="sm" className="rounded-full mt-3 text-xs" onClick={startEditProfile}>
            <Edit2 size={12} /> Edit Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Events", value: String(myEvents.length) },
            { label: "Circles", value: String(myCircles.length) },
            { label: "Friends", value: String(Math.max(0, new Set(myCircles.flatMap((c) => c.members)).size - 1)) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card rounded-2xl p-4 text-center shadow-card">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* My Circles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">My Circles</h3>
            <Button variant="soft" size="sm" className="rounded-full text-xs" onClick={() => setShowAddCircle(!showAddCircle)}>
              {showAddCircle ? <X size={14} /> : <Plus size={14} />}
              {showAddCircle ? "Cancel" : "New"}
            </Button>
          </div>

          {showAddCircle && (
            <div className="p-4 rounded-xl bg-card shadow-card mb-3 space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => circleAvatarRef.current?.click()}
                  className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xl border border-dashed border-border"
                >
                  {newCircleAvatar
                    ? <img src={newCircleAvatar} alt="" className="w-full h-full object-cover" />
                    : <Camera size={18} className="text-muted-foreground" />}
                </button>
                <input ref={circleAvatarRef} type="file" accept="image/*" hidden onChange={handleNewCircleAvatar} />
                <Input
                  placeholder="Circle name (e.g., Uni Friends)"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="h-10 rounded-xl bg-secondary border-0 flex-1"
                />
              </div>
              <Input
                placeholder="Short description (e.g., MIT CS '24, work team)"
                value={newCircleDesc}
                onChange={(e) => setNewCircleDesc(e.target.value)}
                className="h-10 rounded-xl bg-secondary border-0"
              />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Choose an emoji</p>
                <div className="flex flex-wrap gap-2">
                  {CIRCLE_EMOJIS.map((emoji) => (
                    <button key={emoji} onClick={() => setNewCircleEmoji(emoji)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${newCircleEmoji === emoji ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary"}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="hero" className="w-full h-10 rounded-xl text-sm font-semibold" onClick={handleAddCircle}>
                Create Circle
              </Button>
            </div>
          )}

          {myCircles.length > 3 && (
            <Input
              placeholder="Search circles…"
              value={circleSearch}
              onChange={(e) => setCircleSearch(e.target.value)}
              className="h-10 rounded-xl bg-secondary border-0 mb-2"
            />
          )}

          <div className="space-y-2">
            {myCircles
              .filter((g) => !circleSearch || g.name.toLowerCase().includes(circleSearch.toLowerCase()) || (g.description || "").toLowerCase().includes(circleSearch.toLowerCase()))
              .map((group) => (
              <div key={group.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg overflow-hidden">
                  {group.avatarUrl
                    ? <img src={group.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span>{group.emoji}</span>}
                </div>
                <button className="flex-1 min-w-0 text-left" onClick={() => { setManageCircleId(group.id); setEditCircleDesc(group.description || ""); }}>
                  <p className="text-sm font-medium text-card-foreground truncate">{group.name}</p>
                  {group.description && <p className="text-xs text-muted-foreground truncate">{group.description}</p>}
                  <p className="text-[11px] text-muted-foreground">{group.members.length} member{group.members.length === 1 ? "" : "s"}</p>
                </button>
                <button onClick={() => { setManageCircleId(group.id); setEditCircleDesc(group.description || ""); }}
                  className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary">
                  <UserPlus size={14} />
                </button>
                <button onClick={() => removeCircleGroup(group.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {myCircles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No circles yet. Create one to organize your people.
              </p>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Your Interests</h3>
            <Button variant="soft" size="sm" className="rounded-full text-xs"
              onClick={editingInterests ? saveInterests : startEditInterests}>
              {editingInterests ? <Check size={14} /> : <Edit2 size={14} />}
              {editingInterests ? "Save" : "Edit"}
            </Button>
          </div>
          {editingInterests ? (
            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${tempInterests.includes(tag) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((tag) => (
                <span key={tag} className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full font-medium">{tag}</span>
              ))}
              {user.interests.length === 0 && <p className="text-sm text-muted-foreground">No interests selected yet</p>}
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="space-y-1 mb-8">
          {["Privacy Settings", "Notification Preferences", "Help & Support", "About Circle"].map((item) => (
            <button key={item} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-secondary">
              <span className="text-sm text-foreground">{item}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button variant="outline" className="w-full h-12 rounded-xl text-destructive border-destructive/20" onClick={logout}>
          <LogOut size={16} /> Log Out
        </Button>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Display name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-11 rounded-xl bg-secondary border-0 mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Bio</label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3}
                className="rounded-xl bg-secondary border-0 mt-1" placeholder="A few words about you" />
            </div>
            <Button variant="hero" className="w-full h-11 rounded-xl" onClick={saveProfile}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage circle dialog */}
      <Dialog open={!!manageCircleId} onOpenChange={(o) => !o && setManageCircleId(null)}>
        <DialogContent className="max-w-sm rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{manageCircle?.emoji}</span>
              <span>{manageCircle?.name}</span>
            </DialogTitle>
          </DialogHeader>

          {manageCircle && (
            <div className="space-y-5">
              {/* Avatar + description */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => editCircleAvatarRef.current?.click()}
                  className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-xl"
                >
                  {manageCircle.avatarUrl
                    ? <img src={manageCircle.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span>{manageCircle.emoji}</span>}
                </button>
                <input ref={editCircleAvatarRef} type="file" accept="image/*" hidden onChange={handleEditCircleAvatar} />
                <div className="flex-1">
                  <Input
                    placeholder="Short description (e.g., MIT CS '24)"
                    value={editCircleDesc}
                    onChange={(e) => setEditCircleDesc(e.target.value)}
                    onBlur={saveCircleDesc}
                    className="h-9 rounded-xl bg-secondary border-0 text-sm"
                  />
                </div>
              </div>

              {/* Members */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Members ({manageCircle.members.length})</p>
                <div className="space-y-1.5">
                  {manageCircle.members.map((mid) => {
                    const m = profiles.find((p) => p.id === mid);
                    if (!m) return null;
                    return (
                      <div key={mid} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                        {m.avatar
                          ? <img src={m.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                          : <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{m.name[0]}</div>}
                        <span className="text-sm flex-1">{m.name}{m.id === user.id && " (you)"}</span>
                        {m.id !== user.id && (
                          <button onClick={() => removeCircleMember(manageCircle.id, mid)} className="text-muted-foreground hover:text-destructive">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add existing user */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Add an existing user</p>
                <Input placeholder="Search users…" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                  className="h-10 rounded-xl bg-secondary border-0 mb-2" />
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {memberCandidates.map((p) => (
                    <button key={p.id} onClick={() => addCircleMember(manageCircle.id, p.id)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary text-left">
                      {p.avatar
                        ? <img src={p.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{p.name[0]}</div>}
                      <span className="text-sm flex-1">{p.name}</span>
                      <Plus size={14} className="text-primary" />
                    </button>
                  ))}
                  {memberCandidates.length === 0 && <p className="text-xs text-muted-foreground py-2">No users found.</p>}
                </div>
              </div>

              {/* Invite outsiders */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Invite people not on Circle</p>
                <Button variant="soft" className="w-full justify-start gap-2 rounded-xl" onClick={() => buildShare("copy")}>
                  <Copy size={14} /> Copy invite link
                </Button>
                <div className="flex gap-2">
                  <Input placeholder="Phone (with country code)" value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)}
                    className="h-10 rounded-xl bg-secondary border-0" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="soft" className="rounded-xl gap-2" disabled={!invitePhone} onClick={() => buildShare("whatsapp")}>
                    <MessageCircle size={14} /> WhatsApp
                  </Button>
                  <Button variant="soft" className="rounded-xl gap-2" disabled={!invitePhone} onClick={() => buildShare("sms")}>
                    <Phone size={14} /> SMS
                  </Button>
                </div>
                <Input placeholder="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-10 rounded-xl bg-secondary border-0" />
                <Button variant="soft" className="w-full rounded-xl gap-2" disabled={!inviteEmail} onClick={() => buildShare("email")}>
                  <Mail size={14} /> Email invite
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileScreen;
