import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User } from "@shared/schema";
import { Menu, X, User as UserIcon } from "lucide-react";

interface NavbarProps {
  user?: User | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full py-3 px-4 md:px-8 transition-all duration-300 ${
      isScrolled ? "bg-white shadow-md" : "bg-white/80 backdrop-blur-sm"
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <div className="text-2xl font-bold">
                <span className="text-secondary">Swap</span>
                <span className="text-primary">Skill</span>
              </div>
            </a>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={`font-medium ${location === "/" ? "text-primary" : "text-gray-700 hover:text-primary"} transition`}>
              Home
            </a>
          </Link>
          <Link href="/about">
            <a className={`font-medium ${location === "/about" ? "text-primary" : "text-gray-700 hover:text-primary"} transition`}>
              About
            </a>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-4">
                  <UserIcon className="h-4 w-4 mr-2" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile">
                    <a className="w-full">My Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard">
                    <a className="w-full">Dashboard</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth">
                <a className="text-primary font-medium hover:text-primary-dark transition py-2 px-4">
                  LOGIN
                </a>
              </Link>
              <Link href="/signup">
                <Button className="bg-secondary hover:bg-secondary/90 text-white pop-out-effect">
                  SIGN UP
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-3 py-4 px-4 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col space-y-3">
            <Link href="/">
              <a 
                className={`font-medium ${location === "/" ? "text-primary" : "text-gray-700"} py-2 px-3 rounded hover:bg-gray-100`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
            </Link>
            <Link href="/about">
              <a 
                className={`font-medium ${location === "/about" ? "text-primary" : "text-gray-700"} py-2 px-3 rounded hover:bg-gray-100`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
            </Link>
            
            {user ? (
              <>
                <Link href="/profile">
                  <a 
                    className="font-medium text-gray-700 py-2 px-3 rounded hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </a>
                </Link>
                <Link href="/dashboard">
                  <a 
                    className="font-medium text-gray-700 py-2 px-3 rounded hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </a>
                </Link>
                <button
                  className="font-medium text-red-600 py-2 px-3 rounded hover:bg-gray-100 text-left"
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <a 
                    className="font-medium text-primary py-2 px-3 rounded hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </a>
                </Link>
                <Link href="/signup">
                  <a
                    className="font-medium text-white bg-secondary py-2 px-3 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
