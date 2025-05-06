import { Switch, Route, Redirect } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AboutPage from "@/pages/about-page";
import TeamPage from "@/pages/team-page";
import BlogPage from "@/pages/blog-page";
import CareersPage from "@/pages/careers-page";
import ContactPage from "@/pages/contact-page";
import CommunityGuidelinesPage from "@/pages/community-guidelines-page";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import UserDashboard from "@/pages/user-dashboard";
import ProfileEdit from "@/pages/profile-edit";
import ScrollToTop from "@/components/ScrollToTop";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";



// Component to handle the home route and redirect authenticated users
function HomeRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/user-dashboard" />;
  }

  return <HomePage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
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
      <ProtectedRoute path="/profile-edit" component={ProfileEdit} />
      <ProtectedRoute path="/user-dashboard" component={UserDashboard} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop>
        <Navbar />
        <Router />
      </ScrollToTop>
    </AuthProvider>
  );
}

export default App;
