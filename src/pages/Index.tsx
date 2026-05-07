import { useState } from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import AuthScreen from "@/components/AuthScreen";
import HomeFeed from "@/components/HomeFeed";
import DiscoverScreen from "@/components/DiscoverScreen";
import JoinedSpaces from "@/components/JoinedSpaces";
import EventDetail from "@/components/EventDetail";
import CollaborationSpace from "@/components/CollaborationSpace";
import CreateEvent from "@/components/CreateEvent";
import ProfileScreen from "@/components/ProfileScreen";
import NotificationsScreen from "@/components/NotificationsScreen";
import BottomNav from "@/components/BottomNav";

type Screen = "home" | "discover" | "joined" | "create" | "notifications" | "profile" | "event-detail" | "collaboration";

const AppContent = () => {
  const { isAuthenticated, loading, events, notifications } = useApp();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  }
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const navigateToEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setScreen("event-detail");
  };

  if (screen === "collaboration" && selectedEvent) {
    return (
      <CollaborationSpace
        event={selectedEvent}
        onBack={() => setScreen("event-detail")}
      />
    );
  }

  if (screen === "event-detail" && selectedEvent) {
    return (
      <>
        <EventDetail
          event={selectedEvent}
          onBack={() => { setScreen("home"); setSelectedEventId(null); }}
          onJoinSpace={() => setScreen("collaboration")}
        />
        <BottomNav active="" onNavigate={(tab) => { setScreen(tab as Screen); setSelectedEventId(null); }} unreadNotifications={unreadCount} />
      </>
    );
  }

  if (screen === "create") {
    return (
      <>
        <CreateEvent onBack={() => setScreen("home")} onCreated={() => setScreen("home")} />
        <BottomNav active="create" onNavigate={(tab) => setScreen(tab as Screen)} unreadNotifications={unreadCount} />
      </>
    );
  }

  return (
    <>
      <div className="max-w-lg mx-auto">
        {screen === "home" && (
          <HomeFeed onEventClick={navigateToEvent} onDiscover={() => setScreen("discover")} />
        )}
        {screen === "discover" && (
          <DiscoverScreen onEventClick={navigateToEvent} />
        )}
        {screen === "notifications" && (
          <NotificationsScreen onEventClick={navigateToEvent} />
        )}
        {screen === "profile" && <ProfileScreen />}
      </div>
      <BottomNav active={screen} onNavigate={(tab) => setScreen(tab as Screen)} unreadNotifications={unreadCount} />
    </>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
