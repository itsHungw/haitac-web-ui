import type { SVGProps } from 'react';

export function DevilFruitIcon({
  size = 18,
  strokeWidth = 2.2,
  className,
  ...props
}: { size?: number | string; strokeWidth?: number | string; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cuống xoắn ốc T-stem */}
      <path d="M12 6V2.5" />
      <path d="M9 2.5c1.5-.8 4.5-.8 6 0" />
      <path d="M8.5 2.5a1.2 1.2 0 1 0 0 2.4" />
      {/* Thân Trái Ác Quỷ */}
      <path d="M12 6c-4.2 0-7 3.2-7 7.5 0 4.2 3.2 7.5 7 7.5s7-3.3 7-7.5c0-4.3-2.8-7.5-7-7.5z" />
      {/* Hoa văn xoắn ốc Arabesque */}
      <path d="M8.5 10c1-.6 2.2-.2 1.8.8s-1.4.8-1 1.6" />
      <path d="M15.5 11c-1-.6-2.2-.2-1.8.8s1.4.8 1 1.6" />
      <path d="M11 15c1-.6 2.2-.2 1.8.8s-1.4.8-1 1.6" />
    </svg>
  );
}
