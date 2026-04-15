import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import type { Message } from "@/lib/mock-data";

interface ChatTabProps {
  eventId: string;
}

const ChatTab = ({ eventId }: ChatTabProps) => {
  const { user, messages, sendMessage } = useApp();
  const [newMessage, setNewMessage] = useState("");
  const eventMessages = messages[eventId] || [];

  const handleSend = () => {
    if (!newMessage.trim() || !user) return;
    sendMessage(eventId, newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {eventMessages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const isSystem = msg.type === "system";

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center py-2">
                <p className="text-xs text-muted-foreground bg-secondary/50 inline-block px-3 py-1 rounded-full">
                  {msg.content}
                </p>
              </div>
            );
          }

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
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="h-10 rounded-full bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSend}
            variant="hero"
            size="icon"
            className="h-10 w-10 rounded-full flex-shrink-0"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
