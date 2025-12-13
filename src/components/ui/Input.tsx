"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: "default" | "filled";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            variant = "default",
            type = "text",
            disabled,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);

        const baseStyles =
            "w-full rounded-xl px-4 py-3 text-base transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            default:
                "border-2 border-gray-300 bg-white focus:border-blue-600 dark:border-gray-600 dark:bg-gray-800",
            filled:
                "border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:focus:bg-gray-700",
        };

        const errorStyles = error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "";

        return (
            <div className="w-full">
                {label && (
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={type}
                        className={cn(
                            baseStyles,
                            variants[variant],
                            errorStyles,
                            leftIcon && "pl-11",
                            rightIcon && "pr-11",
                            className
                        )}
                        disabled={disabled}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                        {error}
                    </motion.p>
                )}

                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
