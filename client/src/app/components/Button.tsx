import { ReactNode } from "react";
import Link from "next/link";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  href,
}: ButtonProps) {
  const baseClasses =
    "font-bold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-text-light)] hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]",
    secondary:
      "bg-[var(--color-tertiary)] text-[var(--color-text-light)] hover:bg-gray-800 focus:ring-gray-800",
    outline:
      "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-text-primary)] hover:bg-gray-100 focus:ring-gray-800",
  };

  const sizeClasses = {
    sm: "px-[10px] py-[13px] text-[16px]",
    md: "px-4 py-2 text-sm",
    lg: "text-[18px] max-sm:text-[16px] py-[12px] px-[22px]",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-disabled={disabled || undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
