import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={cn(
        "sticky top-0 z-50 bg-white py-3 px-4 md:px-8 flex justify-between items-center transition-shadow duration-300",
        scrolled ? "shadow-md" : ""
      )}
    >
      <div className="flex items-center">
        <Logo />
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex space-x-6 mr-8">
          <Link href="/" className="text-gray-700 hover:text-[hsl(var(--primary-dark))] transition font-medium">
            Home
          </Link>
          <Link href="#about" className="text-gray-700 hover:text-[hsl(var(--primary-dark))] transition font-medium">
            About
          </Link>
        </div>

        <>
          <Link href="/auth" className="text-primary-dark font-medium hover:text-primary transition py-2 px-4">
            LOGIN
          </Link>
          <Link href="/auth" className="bg-secondary hover:bg-secondary-light text-white font-medium py-2 px-4 rounded-full transition pop-out-effect">
            SIGN UP
          </Link>
        </>
      </div>
    </motion.nav>
  );
}
