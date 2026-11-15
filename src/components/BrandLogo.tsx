import React from 'react';

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = 'w-9 h-9' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DevAgile Logo"
    >
      {/* Solid architectural frame */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="8"
        className="fill-zinc-900 dark:fill-zinc-100"
      />
      {/* Cascading three-tier structural bars */}
      <path
        d="M10 13H22L25 16H10V13Z"
        className="fill-teal-400 dark:fill-teal-700"
      />
      <path
        d="M10 19H26L29 22H10V19Z"
        className="fill-white dark:fill-zinc-900"
      />
      <path
        d="M10 25H30V28H10V25Z"
        className="fill-teal-500 dark:fill-teal-600"
      />
      {/* Precision node accent */}
      <rect
        x="27"
        y="11"
        width="4"
        height="4"
        rx="1"
        className="fill-amber-400 dark:fill-amber-600"
      />
    </svg>
  );
};
