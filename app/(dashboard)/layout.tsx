import BreadcrumbHeader from '@/components/BreadcrumbHeader'
import DesktopSidebar from '@/components/sidebar'
import { ModeToggle } from '@/components/ThemeModeToggle'
import { Separator } from '@/components/ui/separator'
import { SignedIn, UserButton } from '@clerk/nextjs'
import React from 'react'

const LayoutPage = ({children}:{children:React.ReactNode}) => {
  return (
    <div className='flex h-screen'>
      <DesktopSidebar/>
        <div className="flex flex-col flex-1 h-1 min-h-screen">
            <header className='flex  items-center justify-between px-6 py-4 h-[50px] container'>
              <BreadcrumbHeader/>
              <div className='gap-1 flex items-center'>
                <SignedIn>
                  <UserButton/>
                </SignedIn>
                <ModeToggle/>
              </div>
            </header>
            <Separator/>
            <div className="overflow-auto">
                <div className="flex-1 container py-4 text-accent-foreground">
                    {children}
                </div>
            </div>
        </div>
    </div>
  )
}

export default LayoutPage