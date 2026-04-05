import { useState } from "react";
import { ArrowLeft, MessageCircle, DollarSign, Map, Send, Plus, Car, Train, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { mockMessages, mockExpenses, type EventItem } from "@/lib/mock-data";

interface CollaborationSpaceProps {
  event: EventItem;
  onBack: () => void;
}

const tabs = [
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "budget", icon: DollarSign, label: "Budget" },
  { id: "travel", icon: Map, label: "Travel" },
];

const CollaborationSpace = ({ event, onBack }: CollaborationSpaceProps) => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState("chat");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [expenses] = useState(mockExpenses);

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return;
    setMessages([
      ...messages,
      {
        id: String(messages.length + 1),
        senderId: user.id,
        senderName: user.name.split(" ")[0],
        senderAvatar: "",
        content: newMessage,
        timestamp: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
      },
    ]);
    setNewMessage("");
  };

  const totalBudget = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPerson = totalBudget / event.participants.length;

  return (
    <div className="flex flex-col h-screen animate-fade-in">
      {/* Header */}
      <div className="glass border-b border-border px-4 pt-3 pb-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="text-foreground">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">{event.title}</h1>
            <p className="text-xs text-muted-foreground">{event.participants.length} members</p>
          </div>
          <div className="flex -space-x-1.5">
            {event.participants.slice(0, 3).map((p) => (
              <div key={p.id} className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-semibold text-secondary-foreground">
                {p.name[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-semibold text-secondary-foreground">
                        {msg.senderName[0]}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : ""}`}>
                      {!isMe && (
                        <p className="text-[11px] text-muted-foreground mb-0.5 ml-1">{msg.senderName}</p>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "gradient-primary text-primary-foreground rounded-tr-md"
                          : "bg-secondary text-secondary-foreground rounded-tl-md"
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-0.5 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-border glass safe-bottom">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="h-10 rounded-full bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={sendMessage}
                  variant="hero"
                  size="icon"
                  className="h-10 w-10 rounded-full flex-shrink-0"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="px-5 py-5 space-y-5 pb-24">
            {/* Summary card */}
            <div className="gradient-primary rounded-2xl p-5 text-primary-foreground">
              <p className="text-sm opacity-80">Total Budget</p>
              <p className="text-3xl font-bold mt-1">${totalBudget.toFixed(2)}</p>
              <div className="flex justify-between mt-3 text-sm opacity-80">
                <span>{expenses.length} expenses</span>
                <span>~${perPerson.toFixed(2)} / person</span>
              </div>
            </div>

            {/* Expenses */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-foreground">Expenses</h3>
                <Button variant="soft" size="sm" className="rounded-full text-xs">
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground">{exp.title}</p>
                      <p className="text-xs text-muted-foreground">Paid by {exp.paidBy} • {exp.date}</p>
                    </div>
                    <p className="font-semibold text-card-foreground">${exp.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "travel" && (
          <div className="px-5 py-5 space-y-5 pb-24">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Getting There</h3>
              <p className="text-sm text-muted-foreground mb-4">{event.location}</p>
            </div>

            {/* Route options */}
            {[
              { icon: Car, mode: "Drive", time: "45 min", distance: "28 miles", color: "text-primary" },
              { icon: Train, mode: "Transit", time: "1h 15min", distance: "2 transfers", color: "text-accent" },
              { icon: Footprints, mode: "Walk", time: "5h 30min", distance: "18 miles", color: "text-success" },
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
        )}
      </div>
    </div>
  );
};

export default CollaborationSpace;
