export default function CrownMark({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Clear Diamond (Outlines Only) */}
      <g stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
        <path d="M 10 4 L 18 4 L 22 9 L 14 21 L 6 9 Z" />
        <path d="M 6 9 L 22 9" />
        <path d="M 10 4 L 10 9" />
        <path d="M 10 4 L 14 9" />
        <path d="M 18 4 L 14 9" />
        <path d="M 18 4 L 18 9" />
        <path d="M 14 21 L 10 9" />
        <path d="M 14 21 L 14 9" />
        <path d="M 14 21 L 18 9" />
      </g>
      {/* Solid Sparkles */}
      <g fill="currentColor">
        <path d="M 6.5 11 Q 6.5 13.5 9 13.5 Q 6.5 13.5 6.5 16 Q 6.5 13.5 4 13.5 Q 6.5 13.5 6.5 11 Z" />
        <path d="M 3 8 Q 3 9.5 4.5 9.5 Q 3 9.5 3 11 Q 3 9.5 1.5 9.5 Q 3 9.5 3 8 Z" />
        <path d="M 4.5 16 Q 4.5 17.5 6 17.5 Q 4.5 17.5 4.5 19 Q 4.5 17.5 3 17.5 Q 4.5 17.5 4.5 16 Z" />
        <path d="M 20.5 3 Q 20.5 4.5 22 4.5 Q 20.5 4.5 20.5 6 Q 20.5 4.5 19 4.5 Q 20.5 4.5 20.5 3 Z" />
      </g>
    </svg>
  );
}
