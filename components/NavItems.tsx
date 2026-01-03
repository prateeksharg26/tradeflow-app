"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import React from "react";
import "./nav.css";

const NavItems = (): React.ReactElement => {
    const pathname = usePathname();

    const isActive = (path: string) =>
        pathname === path || pathname.startsWith(path);

    return (
        <ul className="nav-menu">
            {NAV_ITEMS.map(({ href, label }) => (
                <li key={href}>
                    <Link
                        href={href}
                        className={`nav-link ${isActive(href) ? "active" : ""}`}
                    >
                        {label}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default NavItems;