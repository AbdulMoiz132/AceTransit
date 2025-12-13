"use client";

import { HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "elevated" | "bordered" | "gradient";
    padding?: "none" | "sm" | "md" | "lg";
    hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = "default",
            padding = "md",
            hoverable = false,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = "rounded-2xl transition-all duration-300";

        const variants = {
            default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            elevated:
                "bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700",
            bordered:
                "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600",
            gradient:
                "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700",
        };

        const paddings = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        return (
            <motion.div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    paddings[padding],
                    hoverable && "cursor-pointer",
                    className
                )}
                {...(hoverable && {
                    whileHover: { scale: 1.02, y: -4 },
                    transition: { duration: 0.2 },
                })}
                {...props}
            >
                {children as React.ReactNode}
            </motion.div>
        );
    }
);

Card.displayName = "Card";

export default Card;
