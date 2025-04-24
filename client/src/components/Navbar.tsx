import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold font-poppins text-primary">
                Swap<span className="text-secondary">Skill</span>
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex space-x-8">
              <Link href="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-primary">
                Home
              </Link>
              <Link href="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-primary hover:text-gray-900">
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark hover-pop">
                  Dashboard
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="ml-4"
                >
                  LOGOUT
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth" className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark hover-pop">
                  LOGIN
                </Link>
                <Link href="/auth?signup=true" className="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-secondary rounded-full shadow-sm hover:bg-opacity-90 hover-pop">
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
