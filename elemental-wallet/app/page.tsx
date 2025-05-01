import Link from "next/link"
import { ArrowRight, Wallet, Download, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-dark-brown">Elemental Wallet</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main welcome card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-md">
            <h2 className="text-4xl font-bold text-dark-brown mb-4">Welcome to Elemental</h2>
            <p className="text-mauve text-lg mb-8">Your secure gateway to the world of cryptocurrency</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button asChild className="h-14 text-lg bg-mauve hover:bg-brown text-cream rounded-xl">
                <Link href="/create-wallet" className="flex items-center justify-center">
                  Create New Wallet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-14 text-lg border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
              >
                <Link href="/import-wallet" className="flex items-center justify-center">
                  Import Existing Wallet
                  <Download className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <Button asChild variant="link" className="text-brown">
                <Link href="/login">Already have a wallet? Log in</Link>
              </Button>
            </div>
          </div>

          {/* Features cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <Wallet className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Multi-Currency Support</h3>
              <p className="text-cream/80">Manage Bitcoin, Ethereum, and other cryptocurrencies in one place</p>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <Shield className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
              <p className="text-cream/80">Your assets are protected with advanced encryption technology</p>
            </div>
          </div>
        </div>

        {/* Additional features in bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-dark-brown rounded-3xl p-6 shadow-md text-cream">
            <h3 className="text-xl font-bold mb-2">Seamless Swaps</h3>
            <p className="text-cream/80">Exchange cryptocurrencies with just a few clicks</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-dark-brown mb-2">Real-Time Tracking</h3>
            <p className="text-mauve">Monitor your portfolio value with live market data</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-dark-brown mb-2">Easy Transactions</h3>
            <p className="text-mauve">Send and receive crypto with intuitive controls</p>
          </div>
        </div>
      </div>
    </div>
  )
}
