import Link from "next/link";
import Image from "next/image";

const Layout = ({ children }: { children : React.ReactNode }) => {
    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/assets/icons/logo.svg"
                        alt="Tradeflow logo"
                        width={32}
                        height={32}
                    />
                    <span className="font-bold tracking-wide"
                          style={{ fontSize: "28px",color:"white"}}>Tradeflow</span>
                </Link>
                <div className="pb-6 lg:pb-8 flex-1">{children}</div>
            </section>
            <section className="auth-right-section w-full flex justify-center">
                <div className="z-10 relative lg:mt-4 lg:mb-16 w-full max-w-none">

                    <blockquote className="auth-blockquote">
                        Tradeflow turned my watchlist into a winning list. The alerts are spot-on, and I feel more confident making moves in the market.
                    </blockquote>

                    <div className="flex items-center justify-between w-full mt-4">
                        <div>
                            <cite className="auth-testimonial-author">– Ethan R.</cite>
                            <p className="max-md:text-xs text-gray-500">Retail Investor</p>
                        </div>

                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Image
                                    key={star}
                                    src="/assets/icons/star.svg"
                                    alt="Star"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5"
                                />
                            ))}
                        </div>
                    </div>

                </div>
                <div className="flex-1 relative">
                    <Image src="/assets/images/dashboard.png.png" alt="Dashboard Preview" width={1440} height={1150} className="auth-dashboard-preview absolute top-0" />
                </div>
            </section>
        </main>
    )
}
export default Layout
