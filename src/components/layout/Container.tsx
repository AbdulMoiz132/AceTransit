"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    padding?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
    (
        { className, maxWidth = "xl", padding = true, children, ...props },
        ref
    ) => {
        const maxWidths = {
            sm: "max-w-2xl",
            md: "max-w-4xl",
            lg: "max-w-5xl",
            xl: "max-w-6xl",
            "2xl": "max-w-7xl",
            full: "max-w-full",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "mx-auto w-full",
                    maxWidths[maxWidth],
                    padding && "px-4 sm:px-6 lg:px-8",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Container.displayName = "Container";

export default Container;
