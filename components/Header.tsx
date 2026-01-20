import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";

const Header = async ({ user }: { user: User }) => {
    return (
        <header className="sticky top-0 header">
            <div className="container header-wrapper">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/assets/icons/logo.svg"
                        alt="Tradeflow logo"
                        width={32}
                        height={32}
                        className="h-8 w-auto"
                    />
                    <span
                        className="font-bold tracking-wide"
                        style={{ color: "#ffffff", fontSize: "28px", lineHeight: "1.2" }}
                    >
  Tradeflow
</span>
                </Link>
                <nav className="hidden sm:block">
                    < NavItems />
                </nav>

                <UserDropdown user={user}/>
            </div>
        </header>
    )
}
export default Header