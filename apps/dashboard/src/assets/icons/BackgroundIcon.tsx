export const BackgourndIcon = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0,50 C20,80 40,20 60,50 C80,80 100,20 100,50 L100,100 L0,100 Z"
      fill="url(#gradientWaves)"
      className="opacity-75"
    />
    <path
      d="M0,60 C25,30 50,90 75,60 C90,40 100,70 100,60 L100,100 L0,100 Z"
      fill="url(#gradientWaves)"
      className="opacity-50"
    />
    <defs>
      <linearGradient id="gradientWaves" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="50%" stopColor="#fbcfe8" />
        <stop offset="100%" stopColor="#fed7aa" />
      </linearGradient>
    </defs>
  </svg>
);
