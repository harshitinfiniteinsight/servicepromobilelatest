import React from "react";

interface NFCTapIconProps {
  className?: string;
  strokeWidth?: number;
}

const NFCTapIcon: React.FC<NFCTapIconProps> = ({ className = "", strokeWidth = 2.5 }) => {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g stroke="#3CA8B7" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Hand outline - simplified hand shape */}
        <path d="M28 48C28 42 32 37 37 35C41 33 45 32 50 32C55 32 59 35 61 39C63 43 64 48 64 53L64 58C64 63 61 67 57 69L42 80C38 82 33 82 28 80L18 69C14 67 12 63 12 58L12 48C12 43 15 38 19 36L25 30C28 27 32 26 36 26C40 26 44 28 47 31" />
        
        {/* Card being held by hand */}
        <rect x="58" y="58" width="42" height="28" rx="3" />
        <line x1="63" y1="68" x2="95" y2="68" />
        <line x1="63" y1="76" x2="90" y2="76" />
        
        {/* NFC/Wireless waves emanating from card (right side) */}
        <path d="M100 72C102.5 72 104.5 74 104.5 76.5" opacity="0.8" />
        <path d="M100 72C103.5 72 106.5 75 106.5 79" opacity="0.6" />
        <path d="M100 72C104.5 72 108.5 76 108.5 81.5" opacity="0.4" />
        <path d="M100 72C105.5 72 110.5 77 110.5 84" opacity="0.3" />
        
        {/* NFC signal waves above card (curved arcs) */}
        <path d="M79 58C79 54 81.5 50 84.5 48" opacity="0.7" />
        <path d="M79 58C79 53 82.5 49 86.5 47" opacity="0.5" />
        <path d="M79 58C79 52 83.5 48 88.5 46" opacity="0.3" />
        
        {/* Additional wave on left side */}
        <path d="M58 72C55.5 72 53.5 74 53.5 76.5" opacity="0.6" />
        <path d="M58 72C54.5 72 51.5 75 51.5 79" opacity="0.4" />
      </g>
    </svg>
  );
};

export default NFCTapIcon;

