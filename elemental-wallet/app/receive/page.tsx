"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, QrCode, Share2, Loader2 } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"

import { WalletHeader } from "@/components/wallet-header"

// API service
const API_URL = "http://localhost:3000";

export default function ReceivePage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState("")  
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [recentDeposits, setRecentDeposits] = useState([])
  const [error, setError] = useState(null)

  // Fetch ETH wallet address only
  useEffect(() => {
    const fetchETHAddress = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${API_URL}/api/wallet/accounts`)
        
        // Find ETH address from accounts or use the first account
        if (response.data && response.data.length > 0) {
          // Try to find an ETH account first
          const ethAccount = response.data.find(account => 
            account.type === 'ethereum' || account.currency === 'ETH'
          )
          
          // Use the found ETH account or fall back to the first account
          setWalletAddress(ethAccount ? ethAccount.address : response.data[0].address)
        }
        setIsLoading(false)
      } catch (err) {
        console.error("Error fetching ETH address:", err)
        setError("Failed to load wallet address. Please try again.")
        setIsLoading(false)
      }
    }

    fetchETHAddress()
  }, [])

  // Fetch transaction history
  useEffect(() => {
    const fetchTransactionHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/blockchain/history`)
        
        // Filter only incoming transactions (deposits)
        const deposits = response.data
          .filter(tx => tx.to && tx.to.toLowerCase() === walletAddress.toLowerCase())
          .map(tx => ({
            amount: tx.value || "0",
            symbol: "ETH", // Only show ETH transactions
            from: tx.from,
            timestamp: new Date(tx.timestamp * 1000).toLocaleDateString(),
            hash: tx.hash
          }))
          .slice(0, 5) // Show only the most recent 5 deposits
        
        setRecentDeposits(deposits)
      } catch (err) {
        console.error("Error fetching transaction history:", err)
      }
    }

    if (walletAddress) {
      fetchTransactionHistory()
    }
  }, [walletAddress])

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return ""
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <WalletHeader />

      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8">
        <Button
          variant="ghost"
          className="mb-4 text-dark-brown hover:text-mauve hover:bg-cream"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-md">
              <h2 className="text-3xl font-bold text-dark-brown mb-6">Receive Crypto</h2>

              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-6 bg-cream p-8 rounded-xl">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-60">
                      <Loader2 className="h-8 w-8 animate-spin text-mauve" />
                      <p className="mt-2 text-mauve">Loading wallet address...</p>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <div className="text-sm text-mauve mb-2">Your ETH Address</div>
                      <div className="text-sm font-medium break-all bg-white p-6 rounded-xl text-dark-brown">
                        {walletAddress || "No address available"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    className="bg-mauve hover:bg-brown text-cream rounded-xl h-12 px-8"
                    variant="default"
                    onClick={handleCopyAddress}
                    disabled={isLoading || !walletAddress}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Address Copied!" : "Copy Address"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <QrCode className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Receiving Tips</h3>
              <ul className="space-y-2 text-sm text-cream/80">
                <li>• Share your address to receive crypto</li>
                <li>• Always verify the address is correct</li>
                <li>• Different currencies may have different addresses</li>
                <li>• Transactions may take time to confirm</li>
              </ul>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-2">Recent Deposits</h3>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-cream/80" />
                </div>
              ) : recentDeposits.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {recentDeposits.map((deposit, index) => (
                    <div key={index} className="p-2 bg-cream/10 rounded-lg">
                      <div className="flex justify-between">
                        <div className="font-medium">{deposit.amount} {deposit.symbol}</div>
                        <div className="text-cream/80">{deposit.timestamp}</div>
                      </div>
                      <div className="text-xs text-cream/80">From: {formatAddress(deposit.from)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-cream/80 mt-4">
                  No recent deposits found.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}