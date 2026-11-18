import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "lime";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#074E5B] text-white font-semibold hover:bg-[#0A6271] shadow-[0_14px_30px_-12px_rgba(7,78,91,0.55)] hover:shadow-[0_18px_36px_-10px_rgba(57,169,89,0.45)]",
  lime:
    "bg-[#D6F80B] text-[#072B33] font-semibold hover:bg-[#C6EA08] shadow-[0_14px_32px_-12px_rgba(142,216,40,0.65)]",
  secondary:
    "bg-white text-[#08242B] font-medium border border-[#074E5B]/16 hover:border-[#39A959] hover:bg-[#F7FBFB] shadow-[0_8px_22px_-14px_rgba(7,78,91,0.25)]",
  outline:
    "bg-transparent text-[#074E5B] font-semibold border border-[#074E5B]/30 hover:border-[#074E5B] hover:bg-[#074E5B] hover:text-white",
  ghost:
    "bg-transparent text-[#486369] hover:text-[#08242B] hover:bg-[#074E5B]/6",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs tracking-wide",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-sm sm:text-base",
};

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkButtonProps = SharedProps & {
  href: string;
  target?: string;
  rel?: string;
};

export function Button(props: ButtonProps | LinkButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
  } = props;

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  void _v;
  void _s;
  void _c;
  void _ch;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
