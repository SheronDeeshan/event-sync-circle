import { useState } from "react";
import { Bell, UserPlus, Check, Star, DollarSign, MessageCircle, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import type { Notification } from "@/lib/mock-data";

interface NotificationsScreenProps {
  onEventClick?: (eventId: string) => void;
}

const iconMap: Record<string, any> = {
  match: Star,
  invite: UserPlus,
  accepted: Check,
  join_request: UserPlus,
  expense: DollarSign,
  chat: MessageCircle,
  anonymous_invite: Shield,
};

const NotificationsScreen = ({ onEventClick }: NotificationsScreenProps) => {
  const { notifications, markNotificationRead } = useApp();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="pb-24 pt-2 animate-fade-in">
      <div className="px-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread</p>
          )}
        </div>
      </div>

      <div className="px-5 space-y-2">
        {notifications.map((n) => {
          const Icon = iconMap[n.type] || Bell;
          return (
            <button
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.eventId && onEventClick) {
                  onEventClick(n.eventId);
                }
              }}
              className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl transition-colors ${
                n.unread ? "bg-primary/5" : "bg-card"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.unread ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
              }`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.unread ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[11px] text-muted-foreground">{n.time}</p>
                  {n.actionRequired && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                      Action needed
                    </span>
                  )}
                </div>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
              {n.eventId && <ChevronRight size={14} className="text-muted-foreground mt-2" />}
            </button>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScreen;
