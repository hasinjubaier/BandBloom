import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25A995] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "px-3.5 py-2 text-xs gap-1.5 min-h-[36px]",
    md: "px-5 py-3 text-sm gap-2 min-h-[44px]",
    lg: "px-6 py-3.5 text-base gap-2.5 min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-[#25A995] hover:bg-[#123C3A] text-white shadow-lg shadow-[#25A995]/20 border border-transparent active:scale-[0.99]",
    secondary:
      "bg-[#FF8A65] hover:bg-[#E66D46] text-white shadow-md shadow-[#FF8A65]/20 border border-transparent active:scale-[0.99]",
    outline:
      "bg-white hover:bg-[#F4FAF8] border border-[#D4E8E3] text-[#123C3A] hover:border-[#25A995] dark:bg-[#123C3A] dark:hover:bg-[#0A1C1B] dark:border-[#205653] dark:text-[#F4FAF8] shadow-xs active:scale-[0.99]",
    ghost:
      "bg-transparent hover:bg-[#25A995]/10 text-[#25A995] dark:text-[#25A995] border border-transparent",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const combinedClass = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClass}>
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </Link>
    );
  }

  return (
    <button className={combinedClass} disabled={disabled} {...props}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
}
