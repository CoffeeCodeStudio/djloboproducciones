import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { Music, Disc3 } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      {/* Mesh background inherited from Layout */}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinning disc icon */}
        <Disc3
          className="h-20 w-20 text-neon-cyan animate-[spin_4s_linear_infinite] opacity-60"
          strokeWidth={1.2}
        />

        {/* 404 heading */}
        <h1 className="font-display text-7xl font-bold tracking-wider text-neon-gradient sm:text-8xl">
          404
        </h1>

        {/* DJ-themed message */}
        <p className="max-w-md text-lg text-muted-foreground sm:text-xl">
          Takten försvann inte — men den här sidan finns tyvärr inte.
        </p>

        {/* CTA button */}
        <Link
          to="/"
          className="group mt-4 inline-flex items-center gap-2 rounded-full border-2 border-neon-cyan bg-transparent px-8 py-3 font-display text-sm uppercase tracking-widest text-neon-cyan transition-all duration-300 hover:scale-105 hover:bg-neon-cyan/10 focus-neon tap-target"
        >
          <Music className="h-4 w-4 transition-transform group-hover:rotate-12" />
          Tillbaka till dansgolvet
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
