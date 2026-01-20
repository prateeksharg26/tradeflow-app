import Image from "next/image";
import Link from "next/link";
import UserDropdown from "@/components/UserDropdown";

export default function Navbar({ user }: { user: any }) {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b">
            {/* App Logo — NEVER changes */}
            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="public/assets/images/myphoto.jpeg"
                    alt="Tradeflow logo"
                    width={32}
                    height={32}
                    priority
                />
                <span className="font-bold text-xl">Tradeflow</span>
            </Link>

            {/* User Menu — changes per user */}
            {user && <UserDropdown user={user} />}
        </header>
    );
}