import React from 'react';

interface MahalluLogoProps {
  className?: string;
  size?: number | string;
  title?: string;
}

export const MahalluLogo: React.FC<MahalluLogoProps> = ({ 
  className = "w-10 h-10", 
  size, 
  title = "Edappal Central Mahallu Logo" 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <defs>
        {/* Gradients precisely matching the official Mahallu brand emblem */}
        <linearGradient id="mhl-grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        <linearGradient id="mhl-grad-navy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="30%" stopColor="#0e7490" />
          <stop offset="70%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0a2540" />
        </linearGradient>

        <linearGradient id="mhl-grad-dome" x1="30%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="85%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>

        <linearGradient id="mhl-grad-minaret" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="40%" stopColor="#0f766e" />
          <stop offset="80%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="mhl-grad-ring-left" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <linearGradient id="mhl-grad-ring-right" x1="50%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>

        <filter id="mhl-soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#064e3b" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#mhl-soft-shadow)">
        {/* Outer Circular Braided Ribbons (Left Arc - Deep Teal to Navy) */}
        <path
          d="M 235 48 C 150 50 75 115 62 205 C 50 288 95 375 168 418 C 210 442 260 446 308 435 C 265 448 215 442 175 422 C 105 385 64 305 76 225 C 88 145 155 85 235 78 Z"
          fill="url(#mhl-grad-navy)"
        />

        {/* Outer Circular Braided Ribbons (Right Arc - Emerald to Forest Green) */}
        <path
          d="M 265 48 C 350 50 425 115 438 205 C 450 288 405 375 332 418 C 290 442 240 446 192 435 C 235 448 285 442 325 422 C 395 385 436 305 424 225 C 412 145 345 85 265 78 Z"
          fill="url(#mhl-grad-emerald)"
        />

        {/* Inner Braided Circuit Bands */}
        <path
          d="M 195 55 C 130 85 92 145 92 215 C 92 270 120 325 165 358 C 152 342 138 318 132 290 C 118 228 145 160 195 118 Z"
          fill="url(#mhl-grad-ring-left)"
        />
        <path
          d="M 305 55 C 370 85 408 145 408 215 C 408 270 380 325 335 358 C 348 342 362 318 368 290 C 382 228 355 160 305 118 Z"
          fill="url(#mhl-grad-ring-right)"
        />

        {/* Minaret Crescent Finial */}
        <path
          d="M 203 76 A 7 7 0 1 0 203 90 A 5.5 5.5 0 1 1 203 76 Z"
          fill="url(#mhl-grad-emerald)"
        />

        {/* Minaret Dome & Cupola */}
        <path
          d="M 203 91 L 203 103 L 191 122 L 215 122 Z"
          fill="url(#mhl-grad-minaret)"
        />

        {/* Minaret Upper Balcony */}
        <path
          d="M 187 122 C 187 126 219 126 219 122 L 217 128 L 189 128 Z"
          fill="url(#mhl-grad-minaret)"
        />

        {/* Minaret Upper Shaft with Arched Windows */}
        <path
          d="M 190 128 L 190 178 L 216 178 L 216 128 Z"
          fill="url(#mhl-grad-minaret)"
        />
        {/* Minaret Arched Window Openings */}
        <path
          d="M 198 142 A 5 5 0 0 1 208 142 L 208 162 L 198 162 Z"
          fill="#ffffff"
        />

        {/* Minaret Lower Balcony & Main Shaft */}
        <path
          d="M 186 178 L 220 178 L 218 185 L 188 185 Z"
          fill="url(#mhl-grad-minaret)"
        />
        <path
          d="M 191 185 L 191 278 L 215 278 L 215 185 Z"
          fill="url(#mhl-grad-minaret)"
        />
        {/* Lower Minaret Window */}
        <path
          d="M 198 215 A 5 5 0 0 1 208 215 L 208 238 L 198 238 Z"
          fill="#ffffff"
        />

        {/* Central Mosque Crescent Finial */}
        <path
          d="M 262 135 A 14 14 0 1 0 262 163 A 11 11 0 1 1 262 135 Z"
          fill="url(#mhl-grad-emerald)"
        />
        {/* Finial Spire Stem */}
        <rect x="261" y="161" width="3" height="15" rx="1.5" fill="url(#mhl-grad-emerald)" />

        {/* Majestic Central Mosque Dome */}
        <path
          d="M 262.5 174 C 238 182 222 208 222 238 L 303 238 C 303 208 287 182 262.5 174 Z"
          fill="url(#mhl-grad-dome)"
        />

        {/* Mosque Dome Drum / Arcade Base */}
        <rect x="221" y="240" width="83" height="38" rx="2" fill="url(#mhl-grad-dome)" />
        {/* Arched Openings in Drum */}
        <path d="M 229 252 A 4 4 0 0 1 237 252 L 237 274 L 229 274 Z" fill="#ffffff" />
        <path d="M 245 252 A 4 4 0 0 1 253 252 L 253 274 L 245 274 Z" fill="#ffffff" />
        <path d="M 261 252 A 4 4 0 0 1 269 252 L 269 274 L 261 274 Z" fill="#ffffff" />
        <path d="M 277 252 A 4 4 0 0 1 285 252 L 285 274 L 277 274 Z" fill="#ffffff" />
        <path d="M 293 252 A 4 4 0 0 1 301 252 L 301 274 L 293 274 Z" fill="#ffffff" />

        {/* Digital Neural / Vine Branches Sweeping Upward */}
        <path
          d="M 215 270 C 260 270 300 290 350 250 C 375 230 380 185 345 150 C 310 115 260 100 205 108"
          stroke="url(#mhl-grad-emerald)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 330 262 C 370 280 405 250 415 195"
          stroke="url(#mhl-grad-emerald)"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />

        {/* Botanical Leaves Sprouting from Circuit Branches */}
        {/* Leaf 1 - Upper right */}
        <path
          d="M 368 200 C 385 190 405 195 408 215 C 390 220 370 215 368 200 Z"
          fill="url(#mhl-grad-emerald)"
        />
        {/* Leaf 2 - Middle right */}
        <path
          d="M 345 240 C 365 232 385 242 385 260 C 365 260 348 250 345 240 Z"
          fill="url(#mhl-grad-emerald)"
        />
        {/* Leaf 3 - Lower left leaf near community */}
        <path
          d="M 245 315 C 230 305 210 312 208 330 C 225 330 240 325 245 315 Z"
          fill="url(#mhl-grad-navy)"
        />
        {/* Leaf 4 - Center organic leaf */}
        <path
          d="M 295 305 C 315 292 332 305 328 325 C 310 325 298 315 295 305 Z"
          fill="url(#mhl-grad-emerald)"
        />

        {/* Digital Circuit Terminal Nodes / Circles */}
        <circle cx="348" cy="150" r="8" fill="url(#mhl-grad-emerald)" />
        <circle cx="348" cy="150" r="3.5" fill="#ffffff" />

        <circle cx="415" cy="195" r="8" fill="url(#mhl-grad-emerald)" />
        <circle cx="415" cy="195" r="3.5" fill="#ffffff" />

        <circle cx="318" cy="275" r="7" fill="url(#mhl-grad-emerald)" />
        <circle cx="318" cy="275" r="3" fill="#ffffff" />

        <circle cx="370" cy="315" r="8" fill="url(#mhl-grad-emerald)" />
        <circle cx="370" cy="315" r="3.5" fill="#ffffff" />

        <circle cx="170" cy="175" r="8" fill="url(#mhl-grad-navy)" />
        <circle cx="170" cy="175" r="3.5" fill="#ffffff" />

        <circle cx="155" cy="285" r="8" fill="url(#mhl-grad-navy)" />
        <circle cx="155" cy="285" r="3.5" fill="#ffffff" />

        <circle cx="395" cy="390" r="7" fill="url(#mhl-grad-emerald)" />
        <circle cx="395" cy="390" r="3" fill="#ffffff" />

        {/* United Community / Residents at the Base (4 Interlocked Figures) */}
        {/* Figure 1 (Left - Navy) */}
        <circle cx="205" cy="345" r="14" fill="url(#mhl-grad-navy)" />
        <path
          d="M 187 410 C 187 375 223 375 223 410"
          stroke="url(#mhl-grad-navy)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* Figure 2 (Center-Left) */}
        <circle cx="242" cy="330" r="14" fill="url(#mhl-grad-navy)" />
        <path
          d="M 224 425 C 224 365 260 365 260 425"
          stroke="url(#mhl-grad-navy)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* Figure 3 (Center-Right) */}
        <circle cx="282" cy="330" r="14" fill="url(#mhl-grad-emerald)" />
        <path
          d="M 264 425 C 264 365 300 365 300 425"
          stroke="url(#mhl-grad-emerald)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* Figure 4 (Right - Emerald) */}
        <circle cx="318" cy="350" r="13" fill="url(#mhl-grad-emerald)" />
        <path
          d="M 302 410 C 302 378 334 378 334 410"
          stroke="url(#mhl-grad-emerald)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bottom Interwoven Connecting Ribbon Anchoring the People */}
        <path
          d="M 165 375 C 190 445 315 445 345 375"
          stroke="url(#mhl-grad-navy)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 195 440 C 250 470 290 460 340 435"
          stroke="url(#mhl-grad-emerald)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};
