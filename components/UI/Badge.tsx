// components/UI/badge.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-blue-600 text-white": variant === "default",
          "border-transparent bg-gray-100 text-gray-900":
            variant === "secondary",
          "border-transparent bg-red-500 text-white": variant === "destructive",
          "border-gray-400 bg-transparent": variant === "outline",
          "border-transparent bg-green-500 text-white": variant === "success",
          "border-transparent bg-yellow-500 text-white": variant === "warning",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
