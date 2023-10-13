'use client'

import Navbar from '@/components/Navbar'

export default function RootLayout({ children }) {
    return (
        <>
            <div className={`grid min-h-screen`}>
                <div className="relative bg-muted/50">
                    <Navbar />
                    {children}
                </div>
            </div>
        </>
    )
}
