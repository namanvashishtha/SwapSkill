import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/ui/notification-badge";
import { useNotifications } from "@/hooks/use-notifications";
import { useChat } from "@/hooks/use-chat";
import { Bell, MessageCircle, Users } from "lucide-react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { counts: notificationCounts } = useNotifications();
  const { counts: chatCounts } = useChat();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Force immediate navigation to home page after logout
        setLocation("/");
        // Force a page refresh to ensure all state is cleared
        // window.location.href = "/"; // Alternative approach if needed
      },
    });
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-[100]">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          <span className="text-pink-500">Swap</span>
          <span className="text-black">Skill</span>
        </Link>
        <Link href="/" className="text-primary-dark font-medium hover:text-primary transition py-2 px-4">
          Home
        </Link>
        <Link href="/about" className="text-primary-dark font-medium hover:text-primary transition py-2 px-4">
          About
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <a
              href="/auth"
              onClick={(e) => {
                e.preventDefault();
                console.log("Login button clicked");
                // Force a full page navigation to ensure query parameters are properly handled
                window.location.href = "/auth";
              }}
              className="text-black font-medium hover:text-purple-700 transition py-2 px-4 inline-block"
            >
              LOGIN
            </a>
            <a
              href="/auth?signup=true"
              onClick={(e) => {
                e.preventDefault();
                console.log("Signup button clicked");
                // Force a full page navigation to ensure query parameters are properly handled
                window.location.href = "/auth?signup=true";
              }}
              className="bg-pink-500 hover:bg-white text-white font-medium py-2 px-4 rounded-full transition inline-block border border-pink-500 group"
            >
              <span className="group-hover:text-pink-500 transition-colors">SIGN UP</span>
            </a>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-semibold text-lg mr-4">
              Hello, {user.username}
            </span>
            <Link
              href="/match"
              className="bg-blue-500 text-white font-medium py-2 px-4 rounded-full relative overflow-hidden transition-all duration-300 ease-in-out border border-blue-500 hover:text-blue-500 group mr-2"
            >
              <span className="relative z-10 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Match
              </span>
              <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </Link>
            
            <NotificationBadge count={chatCounts.unreadMessages} className="mr-2">
              <Link
                href="/chat"
                className="bg-green-500 text-white font-medium py-3 px-3 rounded-full relative overflow-hidden transition-all duration-300 ease-in-out border border-green-500 hover:text-green-500 group flex items-center justify-center"
              >
                <span className="relative z-10">
                  <MessageCircle className="w-5 h-5" />
                </span>
                <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
              </Link>
            </NotificationBadge>
            
            <NotificationBadge count={notificationCounts.total} className="mr-2">
              <Link
                href="/notifications"
                className="bg-purple-500 text-white font-medium py-3 px-3 rounded-full relative overflow-hidden transition-all duration-300 ease-in-out border border-purple-500 hover:text-purple-500 group flex items-center justify-center"
              >
                <span className="relative z-10">
                  <Bell className="w-5 h-5" />
                </span>
                <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
              </Link>
            </NotificationBadge>
            <button
              onClick={handleLogout}
              type="button"
              className="bg-red-500 text-white font-medium py-2 px-4 rounded-full relative overflow-hidden transition-all duration-300 ease-in-out border border-red-500 hover:text-red-500 group"
            >
              <span className="relative z-10">Logout</span>
              <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
