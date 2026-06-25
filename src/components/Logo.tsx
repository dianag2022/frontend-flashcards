import Image from "next/image";

const heights = {
  sm: 40,
  md: 56,
  lg: 80,
} as const;

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const height = heights[size];
  const width = Math.round(height * (211 / 155));

  return (
    <Image
      src="/logoRepaso.svg"
      alt="Repaso Reválida Psicología"
      width={width}
      height={height}
      priority={size === "lg"}
      className="object-contain"
      style={{ height, width: "auto", maxWidth: "min(100%, 280px)" }}
    />
  );
}
