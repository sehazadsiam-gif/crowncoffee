export default function CrownMark({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
        <path
          d="M 11 4 L 19 4 L 22 9 L 15 21 L 8 9 Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path d="M 8 9 L 22 9" />
        <path d="M 11 4 L 15 9 L 19 4" />
        <path d="M 11 9 L 15 21 L 19 9" />
      </g>
      <g stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
        <path d="M 5 5 L 5 11 M 2 8 L 8 8" />
        <path d="M 3.5 10.5 L 3.5 14.5 M 1.5 12.5 L 5.5 12.5" />
        <path d="M 8.5 12.5 L 8.5 18.5 M 5.5 15.5 L 11.5 15.5" />
        <path d="M 22 3 L 22 7 M 20 5 L 24 5" />
      </g>
    </svg>
  );
}
