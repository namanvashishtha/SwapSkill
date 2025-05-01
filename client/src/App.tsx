import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about-page";
import TeamPage from "@/pages/team-page";
import BlogPage from "@/pages/blog-page";
import CareersPage from "@/pages/careers-page";
import ContactPage from "@/pages/contact-page";
import CommunityGuidelinesPage from "@/pages/community-guidelines-page";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <HomePage />
      </Route>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <Route path="/about">
        <AboutPage />
      </Route>
      <Route path="/team">
        <TeamPage />
      </Route>
      <Route path="/community-guidelines">
        <CommunityGuidelinesPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

import ScrollToTop from "@/components/ScrollToTop";

function App() {
  return (
    <AuthProvider>
      <ScrollToTop>
        <Router />
      </ScrollToTop>
    </AuthProvider>
  );
}

export default App;
