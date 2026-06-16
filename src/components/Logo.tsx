import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <div className="w-10 h-10 bg-[#2c7a7a] rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20 transform group-hover:scale-105 transition-transform">
        <Bot className="w-6 h-6" />
      </div>
      {!iconOnly && (
        <span className="text-2xl font-display font-bold italic text-[#2c7a7a] tracking-tighter">
          Vic Ai
        </span>
      )}
    </Link>
  );
}
