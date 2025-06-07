import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setMenuOpen(false);
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Force immediate navigation to home page after logout
        setLocation("/");
        // Force a page refresh to ensure all state is cleared
        // window.location.href = "/"; // Alternative approach if needed
      },
    });
  };

  const handleNotificationClick = () => {
    setMenuOpen(false);
    setLocation("/notifications");
  };

  const handleChatClick = () => {
    setMenuOpen(false);
    setLocation("/chat");
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md fixed top-0 left-0 right-0 z-[100]">
      {/* Logo and desktop links */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold">
          <span className="text-pink-500">Swap</span>
          <span className="text-black">Skill</span>
        </Link>
        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" className="text-primary-dark font-medium hover:text-primary transition py-2 px-4">
            Home
          </Link>
          <Link href="/about" className="text-primary-dark font-medium hover:text-primary transition py-2 px-4">
            About
          </Link>
        </div>
      </div>

      {/* Desktop right side */}
      <div className="hidden md:flex items-center space-x-4">
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
            
            <button
              onClick={handleChatClick}
              className="bg-green-500 text-white font-medium py-3 px-3 rounded-full relative overflow-hidden transition-all duration-300 ease-in-out border border-green-500 hover:text-green-500 group flex items-center justify-center mr-2"
            >
              <span className="relative z-10">
                <MessageCircle className="w-5 h-5" />
              </span>
              <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </button>
            
            <button
              onClick={handleNotificationClick}
              className="bg-purple-500 text-white font-medium py-3 px-3 rounded-full relative overflow-hidden transition-all duration-300 ease-in-out border border-purple-500 hover:text-purple-500 group flex items-center justify-center mr-2"
            >
              <span className="relative z-10">
                <Bell className="w-5 h-5" />
              </span>
              <span className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </button>
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

      {/* Hamburger for mobile */}
      <div className="md:hidden flex items-center">
        <button
          className="focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open menu"
        >
          <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div ref={menuRef} className="absolute top-full left-0 w-full bg-white shadow-lg z-50 animate-fade-in">
          <div className="flex flex-col py-2 px-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-primary-dark font-medium hover:text-primary transition py-2 px-2 rounded">
              Home
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className="text-primary-dark font-medium hover:text-primary transition py-2 px-2 rounded">
              About
            </Link>
            {!user ? (
              <>
                <a
                  href="/auth"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    window.location.href = "/auth";
                  }}
                  className="text-black font-medium hover:text-purple-700 transition py-2 px-2 rounded"
                >
                  LOGIN
                </a>
                <a
                  href="/auth?signup=true"
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    window.location.href = "/auth?signup=true";
                  }}
                  className="bg-pink-500 hover:bg-white text-white hover:text-pink-500 font-medium py-2 px-2 rounded-full transition border border-pink-500 text-center"
                >
                  SIGN UP
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/match"
                  onClick={() => setMenuOpen(false)}
                  className="bg-blue-500 text-white font-medium py-2 px-2 rounded-full border border-blue-500 hover:text-blue-500 hover:bg-white transition text-center"
                >
                  <span className="flex items-center justify-center"><Users className="w-5 h-5 mr-2" />Match</span>
                </Link>
                <button
                  onClick={handleChatClick}
                  className="bg-green-500 text-white font-medium py-2 px-2 rounded-full border border-green-500 hover:text-green-500 hover:bg-white transition flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNotificationClick}
                  className="bg-purple-500 text-white font-medium py-2 px-2 rounded-full border border-purple-500 hover:text-purple-500 hover:bg-white transition flex items-center justify-center"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  type="button"
                  className="bg-red-500 text-white font-medium py-2 px-2 rounded-full border border-red-500 hover:text-red-500 hover:bg-white transition text-center"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
