import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export default function Logo({ className, variant = "light" }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <div className="flex items-center gap-2">
        <div className="font-poppins font-bold text-2xl">
          <span className="text-pink-500">Swap</span>
          <span className={variant === "light" ? "text-white" : "text-gray-800"}>Skill</span>
        </div>
        <div className="bg-pink-500 text-white text-xs px-2 py-1 rounded-md font-semibold">
          BETA
        </div>
      </div>
    </Link>
  );
}
