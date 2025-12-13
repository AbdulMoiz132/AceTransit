"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "error" | "info" | "neutral";
    size?: "sm" | "md" | "lg";
    withDot?: boolean;
    pulse?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    (
        {
            className,
            variant = "neutral",
            size = "md",
            withDot = false,
            pulse = false,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center gap-1.5 rounded-full font-medium transition-all";

        const variants = {
            success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        };

        const sizes = {
            sm: "text-xs px-2 py-0.5",
            md: "text-sm px-3 py-1",
            lg: "text-base px-4 py-1.5",
        };

        const dotColors = {
            success: "bg-green-500",
            warning: "bg-yellow-500",
            error: "bg-red-500",
            info: "bg-blue-500",
            neutral: "bg-gray-500",
        };

        return (
            <span
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {withDot && (
                    <span
                        className={cn(
                            "h-2 w-2 rounded-full",
                            dotColors[variant],
                            pulse && "animate-pulse"
                        )}
                    />
                )}
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

export default Badge;
