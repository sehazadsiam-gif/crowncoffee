export default function CrownMark({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 8.5L6.4 11l2.4-4.6 3.2 4.8 3.2-4.8L17.6 11 21 8.5l-1.7 8.6H4.7L3 8.5z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="6.6" r="1.2" fill="currentColor" />
      <circle cx="12" cy="5" r="1.2" fill="currentColor" />
      <circle cx="21" cy="6.6" r="1.2" fill="currentColor" />
    </svg>
  );
}
