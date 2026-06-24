import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-card card-shadow border border-white ${className}`}>
      {children}
    </div>
  );
}
