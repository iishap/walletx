import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AccountProvider } from "@/contexts/account-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Elemental Wallet",
  description: "A modern cryptocurrency wallet",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  )
}
