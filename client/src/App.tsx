import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Interview from "@/pages/interview";
import Review from "@/pages/review";
import Success from "@/pages/success";
import { StoryProvider } from "@/lib/story-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/interview" component={Interview} />
      <Route path="/review" component={Review} />
      <Route path="/success" component={Success} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StoryProvider>
          <Toaster />
          <Router />
        </StoryProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
