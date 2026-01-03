"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import { LogOut } from "lucide-react";
import NavItems from "@/components/NavItems";

const UserDropdown = (): React.ReactElement => {
    const router = useRouter();

    const handleSignOut = async () => {
        router.push("/sign-in");
    }
    const user = { name: 'Prateeksha', email: 'contact@pg.com' };


    return (

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 text-gray-400">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://static.vecteezy.com/system/resources/previews/016/227/291/non_2x/bull-with-chart-bar-logo-design-finance-logo-design-free-vector.jpg" />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>

                    {/* Show ONLY name here — not email */}
                    <span className="text-base font-medium">
      {user.name}
    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="text-gray-300">
                <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src="https://static.vecteezy.com/system/resources/previews/016/227/291/non_2x/bull-with-chart-bar-logo-design-finance-logo-design-free-vector.jpg" />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>

                        <div className="text-base font-medium text-gray-400">
                            {user.name}
                        <br/>

                            <span className="text-sm text-gray-400">
                                {user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown;