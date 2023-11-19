import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

import StyledComponentsRegistry from '../lib/AntdRegistry'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Personal Finances',
    description: 'Personal finances dashboard created with React and D3',
    icons: { icon: "./icon.png" }
}

export default function RootLayout({
    children,
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </body>
        </html>
    )
}
