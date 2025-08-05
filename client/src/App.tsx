import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import CreateEvent from "@/pages/create-event";
import JoinEvent from "@/pages/join-event";
import OrganizerDashboard from "@/pages/organizer-dashboard";
import ParticipantDashboard from "@/pages/participant-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreateEvent} />
      <Route path="/create" component={CreateEvent} />
      <Route path="/join/:eventId" component={JoinEvent} />
      <Route path="/dashboard/:eventId" component={OrganizerDashboard} />
      <Route path="/my/:eventId" component={ParticipantDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
