import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/">
      <a className={cn("flex items-center", className)}>
        <div className="text-primary font-poppins font-bold text-2xl">
          <span className="text-secondary">Swap</span>Skill
        </div>
      </a>
    </Link>
  );
}
