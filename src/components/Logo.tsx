import Image from "next/image";

export const MARK_SRC = "/unnamed.png";
export const WORDMARK_SRC = "/logoRepaso.svg";

const markSizes = {
  sm: 40,
  md: 48,
  lg: 72,
} as const;

const wordmarkHeights = {
  sm: 40,
  md: 56,
  lg: 80,
} as const;

export function Logo({
  size = "md",
  variant,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "full";
}) {
  const resolvedVariant = variant ?? (size === "sm" ? "mark" : "full");

  if (resolvedVariant === "mark") {
    if (size === "lg") {
      const height = 160;
      const width = Math.round(height * (600 / 818));
      return (
        <Image
          src={MARK_SRC}
          alt="Repaso Reválida Psicología"
          width={width}
          height={height}
          priority
          className="object-contain"
          style={{ height, width: "auto" }}
        />
      );
    }

    const dim = markSizes[size];
    return (
      <Image
        src={MARK_SRC}
        alt="Repaso Reválida Psicología"
        width={dim}
        height={dim}
        className="object-cover object-top"
        style={{ height: dim, width: dim }}
      />
    );
  }

  const height = wordmarkHeights[size];
  const width = Math.round(height * (211 / 155));

  return (
    <Image
      src={WORDMARK_SRC}
      alt="Repaso Reválida Psicología"
      width={width}
      height={height}
      priority={size === "lg"}
      className="object-contain"
      style={{ height, width: "auto", maxWidth: "min(100%, 280px)" }}
    />
  );
}
