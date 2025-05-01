import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
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
            <Link
              href="/auth"
              className="text-black font-medium hover:text-purple-700 transition py-2 px-4"
            >
              LOGIN
            </Link>
            <Link
              href="/auth?signup=true"
              className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-full transition"
            >
              SIGN UP
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-semibold text-lg mr-4">
              Hello, {user.username}
            </span>
            <Button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded relative overflow-hidden 
                          transition-all duration-300 ease-in-out
                          hover:bg-white hover:text-red-500
                          before:content-[''] 
                          before:absolute 
                          before:inset-0 
                          before:bg-white 
                          before:scale-x-0 
                          before:origin-left 
                          before:transition-transform 
                          before:duration-300 
                          before:ease-in-out 
                          hover:before:scale-x-100
                          z-10"
              >
                <span className="relative z-20">Logout</span>
              </Button>

          </>
        )}
      </div>
    </nav>
  );
}
