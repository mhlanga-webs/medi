import React from 'react';

interface LogoProps {
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ onClick }) => (
  <div className="flex items-center gap-3 cursor-pointer group" aria-hidden="true" onClick={onClick}>
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="#60a5fa" strokeWidth="4"/>
        
        {/* Left Brain Half (Blue) */}
        <path d="M50 10C35 10 25 25 25 50C25 75 35 90 50 90V10Z" fill="#2563eb"/>
        <path d="M48,12 C38,15 30,28 30,50 C30,72 38,85 48,88 L48,12 Z" fill="#0b2545" opacity="0.2"/>
        
        {/* Right Brain Half (Light Blue) */}
        <path d="M50 10C65 10 75 25 75 50C75 75 65 90 50 90V10Z" fill="#93c5fd"/>
        <path d="M52,12 C62,15 70,28 70,50 C70,72 62,85 52,88 L52,12 Z" fill="#0b2545" opacity="0.2"/>
        
        {/* Left Bars */}
        <rect x="32" y="45" width="6" height="25" fill="#ffffff" rx="2"/>
        <rect x="40" y="35" width="6" height="35" fill="#ffffff" rx="2"/>

        {/* Left Arrow */}
        <path d="M37 40 L37 25 L43 25 L34 15 L25 25 L31 25 L31 40 Z" fill="#ffffff"/>

        {/* Right Bars */}
        <rect x="54" y="20" width="6" height="40" fill="#ffffff" rx="2"/>
        <rect x="62" y="20" width="6" height="30" fill="#ffffff" rx="2"/>

        {/* Right Arrow */}
        <path d="M63 55 L63 70 L57 70 L66 80 L75 70 L69 70 L69 55 Z" fill="#ffffff"/>
    </svg>
    <div>
        <h1 className="text-xl font-bold text-white tracking-wider group-hover:text-blue-200 transition-colors">
        MEDIMIND
        </h1>
        <p className="text-xs text-blue-200 tracking-[0.2em]">
        SENTIMENT ANALYSIS
        </p>
    </div>
  </div>
);
