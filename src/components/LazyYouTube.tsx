import { useState } from "react";
import { Play } from "lucide-react";

interface LazyYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
}

const LazyYouTube = ({ videoId, title, className = "" }: LazyYouTubeProps) => {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <button
      onClick={() => setLoaded(true)}
      className={`w-full h-full relative group cursor-pointer bg-black ${className}`}
      aria-label={`Spela video: ${title}`}
    >
      {/* YouTube thumbnail */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={`Förhandsvisning av video: ${title}`}
        className="w-full h-full object-cover"
        loading="lazy"
        width={480}
        height={360}
      />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neon-pink/90 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
};

export default LazyYouTube;
