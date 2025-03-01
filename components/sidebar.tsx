"use client"
import { CoinsIcon, HomeIcon, Layers2Icon, MenuIcon, ShieldCheck, ShieldCheckIcon } from 'lucide-react'
import React, { useState } from 'react'
import Logo from './Logo'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import UserAvailableCreditsBadge from './UserAvailableCreditsBadge'

const Routes = [
    {
        href: "",
        label: "Home",
        icons: HomeIcon,
    },
    {
        href: "workflows",
        label: "WorkFlows",
        icons: Layers2Icon,
    },
    {
        href: "credentials",
        label: "Credentials",
        icons: ShieldCheckIcon,
    },
    {
        href: "billing",
        label: "Billing",
        icons: CoinsIcon,
    },
]
const DesktopSidebar = () => {
    const pathname = usePathname();
    const activeRoutes = Routes.find((route) => route.href.length > 0 && pathname.includes(route.href)) || Routes[0]
    return (
        <div className='hidden relative md:block min-w-[280px] max-w-[280px] h-screen overflow-hidden w-full bg-primary/5 dark:bg-secondary/30 dark:text-foreground
    text-muted-foreground border-r-2 border-separate'><div className='flex  items-center justify-center gap-2 border-b-[1px] border-separate p-4'>
                <Logo /> </div>
                <div className='p-2'><UserAvailableCreditsBadge/></div>
            <div className='flex flex-col p-2'>
                {
                    Routes.map(route => (
                        <Link key={route.href} href={`/${route.href}`} className={buttonVariants({
                            variant: activeRoutes.href === route.href ? "sidebarActiveItem" : "sidebarItem"
                        })}>
                            <route.icons size={20} />
                            {route.label}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}
export const MobileSidebar = () => {
    const [isOpen, setOpen] = useState(false);
    const pathname = usePathname();
    const activeRoutes = Routes.find((route) => route.href.length > 0 && pathname.includes(route.href)) || Routes[0]
    return (
        <div className='block border-separate bg-background md:hidden'>
            <nav className='container flex items-center justify-between px-8'>
                <Sheet open={isOpen} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant={"ghost"} size={"icon"}>
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className='w-[400px] sm:w-[540px] space-y-4' side={"left"}>
                        <Logo />
                        <UserAvailableCreditsBadge/>
                        <div className='flex flex-col gap-1'>
                            {
                                Routes.map(route => (
                                    <Link key={route.href} href={`/${route.href}`} className={buttonVariants({
                                        variant: activeRoutes.href === route.href ? "sidebarActiveItem" : "sidebarItem"
                                    })}>
                                        <route.icons size={20} onClick={()=>(setOpen(prev=>!prev))} />
                                        {route.label}
                                    </Link>
                                ))
                            }
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
    )
}
export default DesktopSidebar