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
import SafetyTipsPage from "@/pages/safety-tips-page";
import SuccessStoriesPage from "@/pages/success-stories-page";
import SkillCategoriesPage from "@/pages/skill-categories-page";
import SupportPage from "@/pages/support-page";
import PressPage from "@/pages/press-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import UserDashboard from "@/pages/user-dashboard";
import ProfileEdit from "@/pages/profile-edit";
import ProfilePage from "@/pages/profile-page";
import MatchPage from "@/pages/match-page";
import NotificationsPage from "./pages/notifications-page";
import ChatPage from "@/pages/chat-page";
import ScrollToTop from "@/components/ScrollToTop";
import DynamicScrollbar from "@/components/DynamicScrollbar";
import { Loader2 } from "lucide-react";
// Import the main Navbar component
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
    // Use window.location for a full page reload to ensure proper state
    window.location.href = "/user-dashboard";
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
        <span className="ml-2">Redirecting to dashboard...</span>
      </div>
    );
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
      
      <Route path="/blog">
        <BlogPage />
      </Route>

      <Route path="/about">
        <AboutPage />
      </Route>
      <Route path="/team">
        <TeamPage />
      </Route>
      <Route path="/careers">
        <CareersPage />
      </Route>
      <Route path="/contact">
        <ContactPage />
      </Route>
      <Route path="/community-guidelines">
        <CommunityGuidelinesPage />
      </Route>
      <Route path="/safety-tips">
        <SafetyTipsPage />
      </Route>
      <Route path="/success-stories">
        <SuccessStoriesPage />
      </Route>
      <Route path="/skill-categories">
        <SkillCategoriesPage />
      </Route>
      <Route path="/support">
        <SupportPage />
      </Route>
      <Route path="/press">
        <PressPage />
      </Route>
      <Route path="/terms">
        <TermsPage />
      </Route>
      <Route path="/privacy-policy">
        <PrivacyPolicyPage />
      </Route>
      <Route path="/cookie-policy">
        <CookiePolicyPage />
      </Route>
      <ProtectedRoute path="/profile-edit" component={ProfileEdit} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/user-dashboard" component={UserDashboard} />
      <ProtectedRoute path="/match" component={MatchPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
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
        <DynamicScrollbar />
        <Navbar />
        <div className="pt-16"> {/* Add padding to account for fixed navbar */}
          <Router />
        </div>
      </ScrollToTop>
    </AuthProvider>
  );
}

export default App;
