import { useState } from "react";
import { ArrowLeft, MessageCircle, DollarSign, Map, Users } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { type EventItem } from "@/lib/mock-data";
import ChatTab from "@/components/collaboration/ChatTab";
import BudgetTab from "@/components/collaboration/BudgetTab";
import TravelTab from "@/components/collaboration/TravelTab";

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
            {event.participants.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                +{event.participants.length - 3}
              </div>
            )}
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
        {activeTab === "chat" && <ChatTab eventId={event.id} />}
        {activeTab === "budget" && <BudgetTab event={event} />}
        {activeTab === "travel" && <TravelTab event={event} />}
      </div>
    </div>
  );
};

export default CollaborationSpace;
