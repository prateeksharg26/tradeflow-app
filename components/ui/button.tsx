"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost";
};

export function Button({ variant = "default", className = "", ...props }: ButtonProps) {
    const base =
        "px-3 py-2 rounded-md text-sm font-medium transition";

    const styles =
        variant === "ghost"
            ? "bg-transparent hover:bg-gray-700 text-gray-300"
            : "bg-gray-800 hover:bg-gray-700 text-white";

    return (
        <button className={`${base} ${styles} ${className}`} {...props} />
    );
}