import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import { AuthProvider } from "@/contexts/auth-context";
import { PostProvider } from "@/contexts/post-context";
import AgeVerification from "@/components/age-verification";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile/:username" component={Profile} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:userId" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <PostProvider>
            <TooltipProvider>
              <AgeVerification>
                <Toaster />
                <Router />
              </AgeVerification>
            </TooltipProvider>
          </PostProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
