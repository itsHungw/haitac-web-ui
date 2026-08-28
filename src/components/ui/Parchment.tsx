import type { ReactNode } from 'react';

export function Parchment({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`forum-scroll ${className}`.trim()}>
    <div className="forum-scroll__top" aria-hidden="true" />
    <div className="forum-scroll__middle">{children}</div>
    <div className="forum-scroll__bottom" aria-hidden="true" />
  </section>;
}
