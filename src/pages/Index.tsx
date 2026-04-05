import { useState } from "react";
import { AppProvider, useApp } from "@/contexts/AppContext";
import AuthScreen from "@/components/AuthScreen";
import HomeFeed from "@/components/HomeFeed";
import EventDetail from "@/components/EventDetail";
import CollaborationSpace from "@/components/CollaborationSpace";
import CreateEvent from "@/components/CreateEvent";
import ProfileScreen from "@/components/ProfileScreen";
import NotificationsScreen from "@/components/NotificationsScreen";
import BottomNav from "@/components/BottomNav";

type Screen = "home" | "discover" | "create" | "notifications" | "profile" | "event-detail" | "collaboration";

const AppContent = () => {
  const { isAuthenticated, events } = useApp();
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

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
        <BottomNav active="" onNavigate={(tab) => { setScreen(tab as Screen); setSelectedEventId(null); }} />
      </>
    );
  }

  if (screen === "create") {
    return (
      <>
        <CreateEvent onBack={() => setScreen("home")} onCreated={() => setScreen("home")} />
        <BottomNav active="create" onNavigate={(tab) => setScreen(tab as Screen)} />
      </>
    );
  }

  return (
    <>
      <div className="max-w-lg mx-auto">
        {screen === "home" && (
          <HomeFeed onEventClick={(id) => { setSelectedEventId(id); setScreen("event-detail"); }} />
        )}
        {screen === "discover" && (
          <HomeFeed onEventClick={(id) => { setSelectedEventId(id); setScreen("event-detail"); }} />
        )}
        {screen === "notifications" && <NotificationsScreen />}
        {screen === "profile" && <ProfileScreen />}
      </div>
      <BottomNav active={screen} onNavigate={(tab) => setScreen(tab as Screen)} />
    </>
  );
};

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
