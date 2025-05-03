"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { WalletHeader } from "@/components/wallet-header"

const API_URL = "http://localhost:3000";

// Transaction list component with real data integration
const TransactionList = ({ extended = false, filter = "all", search = "" }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/blockchain/history`)
        if (!response.ok) throw new Error("Failed to fetch transaction history")
        
        const data = await response.json()
        setTransactions(data.transactions || [])
      } catch (error) {
        console.error("Error fetching transaction history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Filter transactions based on user selection
  const filteredTransactions = transactions.filter(tx => {
    // First apply type filter
    if (filter !== "all") {
      if (filter === "send" && tx.type !== "sent") return false
      if (filter === "receive" && tx.type !== "received") return false
      if (filter === "swap" && tx.type !== "swap") return false
    }
    
    // Then apply search filter if any
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        tx.hash?.toLowerCase().includes(searchLower) ||
        tx.from?.toLowerCase().includes(searchLower) ||
        tx.to?.toLowerCase().includes(searchLower) ||
        tx.value?.toString().includes(searchLower) ||
        tx.tokenSymbol?.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  if (loading) {
    return <div className="text-center py-8">Loading transaction history...</div>
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-mauve">
        {transactions.length === 0 
          ? "No transactions found for this wallet" 
          : "No transactions match your filters"}
      </div>
    )
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    const date = new Date(timestamp * 1000)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-green-500"
      case "pending": return "text-yellow-500"
      case "failed": return "text-red-500"
      default: return "text-mauve"
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "sent": return "→"
      case "received": return "←"
      case "swap": return "⇄"
      default: return "•"
    }
  }

  return (
    <div className="space-y-4">
      {filteredTransactions.map((tx) => (
        <div key={tx.hash} className="flex items-center p-4 bg-cream rounded-xl hover:bg-cream/80 transition-colors">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            tx.type === "sent" ? "bg-red-100 text-red-500" :
            tx.type === "received" ? "bg-green-100 text-green-500" :
            "bg-blue-100 text-blue-500"
          }`}>
            <span className="text-xl font-bold">{getTypeIcon(tx.type)}</span>
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <div className="font-medium text-dark-brown">
                {tx.type === "sent" ? "Sent" : 
                 tx.type === "received" ? "Received" : "Swapped"} 
                {tx.tokenSymbol ? ` ${tx.tokenSymbol}` : " ETH"}
              </div>
              <div className="font-bold">
                {tx.type === "sent" ? "-" : "+"}
                {tx.value} {tx.tokenSymbol || "ETH"}
              </div>
            </div>
            
            <div className="flex justify-between mt-1">
              <div className="text-sm text-mauve">
                {formatDate(tx.timestamp)}
              </div>
              <div className={`text-sm ${getStatusColor(tx.status)}`}>
                {tx.status || "Processing"}
              </div>
            </div>
            
            {extended && (
              <div className="mt-2 text-xs text-mauve">
                <div className="grid grid-cols-2 gap-2">
                  <div>From: {formatAddress(tx.from)}</div>
                  <div>To: {formatAddress(tx.to)}</div>
                  <div className="col-span-2">
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-mauve hover:text-dark-brown underline"
                    >
                      View on Explorer: {formatAddress(tx.hash)}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ActivityPage() {
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [summary, setSummary] = useState({
    totalSent: 0,
    totalReceived: 0,
    netBalance: 0,
    totalTransactions: 0
  })
  const [walletActivity, setWalletActivity] = useState([])
  const [exportLoading, setExportLoading] = useState(false)

  // Fetch transaction history for summary calculation
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/blockchain/history`)
        if (!response.ok) throw new Error("Failed to fetch transaction history")
        
        const data = await response.json()
        const transactions = data.transactions || []
        
        // Calculate summary
        let sent = 0
        let received = 0
        let count = transactions.length
        
        transactions.forEach(tx => {
          if (tx.type === "sent") {
            sent += parseFloat(tx.value || 0)
          } else if (tx.type === "received") {
            received += parseFloat(tx.value || 0)
          }
        })
        
        setSummary({
          totalSent: sent.toFixed(4),
          totalReceived: received.toFixed(4),
          netBalance: (received - sent).toFixed(4),
          totalTransactions: count
        })
        
        // Get wallet activity (creation, password changes, etc.)
        // In a real implementation, this should come from a separate API endpoint
        // For now, we'll use some example data based on the wallet APIs
        const accounts = await fetch(`${API_URL}/api/wallet/accounts`)
        const accountsData = await accounts.json()
        
        // Build activity log based on account creation dates and other events
        // This would ideally come from a dedicated endpoint
        const activityLog = [
          {
            type: "Wallet Created",
            date: new Date(accountsData[0]?.createdAt || Date.now()).toISOString()
          }
        ]
        
        if (transactions.length > 0) {
          activityLog.push({
            type: "First Transaction",
            date: new Date(transactions[0].timestamp * 1000).toISOString()
          })
        }
        
        setWalletActivity(activityLog)
      } catch (error) {
        console.error("Error fetching wallet data:", error)
      }
    }

    fetchTransactions()
  }, [])

  const handleExportTransactions = async () => {
    try {
      setExportLoading(true)
      
      // Fetch transaction history
      const response = await fetch(`${API_URL}/api/blockchain/history`)
      if (!response.ok) throw new Error("Failed to fetch transaction history")
      
      const data = await response.json()
      const transactions = data.transactions || []
      
      // Convert to CSV format
      const headers = [
        "Type", "Hash", "Status", "From", "To", 
        "Value", "Token", "Timestamp", "Network"
      ].join(",")
      
      const rows = transactions.map(tx => [
        tx.type || "",
        tx.hash || "",
        tx.status || "",
        tx.from || "",
        tx.to || "",
        tx.value || "",
        tx.tokenSymbol || "ETH",
        new Date(tx.timestamp * 1000).toISOString() || "",
        tx.network || ""
      ].join(","))
      
      const csv = [headers, ...rows].join("\n")
      
      // Create and download the file
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wallet-transactions-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting transactions:", error)
      alert("Failed to export transactions. Please try again.")
    } finally {
      setExportLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-3xl font-bold text-dark-brown">Activity</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Input
                      placeholder="Search transactions"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                  </div>
                  <Select defaultValue={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent className="bg-cream border-mauve/10">
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="send">Sent</SelectItem>
                      <SelectItem value="receive">Received</SelectItem>
                      <SelectItem value="swap">Swaps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="transactions" className="mb-6">
                <TabsList className="bg-cream">
                  <TabsTrigger
                    value="transactions"
                    className="data-[state=active]:bg-mauve data-[state=active]:text-cream"
                  >
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="data-[state=active]:bg-mauve data-[state=active]:text-cream"
                  >
                    Wallet Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="pt-6">
                  <TransactionList extended filter={filter} search={searchTerm} />
                </TabsContent>

                <TabsContent value="activity" className="pt-6">
                  <div className="space-y-4">
                    {walletActivity.length === 0 ? (
                      <div className="text-center py-8 text-mauve">No wallet activity found</div>
                    ) : (
                      walletActivity.map((activity, index) => (
                        <div key={index} className="flex items-center p-4 bg-cream rounded-xl">
                          <div className="flex-1">
                            <div className="font-medium text-dark-brown">{activity.type}</div>
                            <div className="text-sm text-mauve">{formatDate(activity.date)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                variant="outline"
                className="w-full border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
                onClick={handleExportTransactions}
                disabled={exportLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                {exportLoading ? "Exporting..." : "Export Transaction History"}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-4">Transaction Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>Total Sent</div>
                  <div className="font-medium">{summary.totalSent} ETH</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Total Received</div>
                  <div className="font-medium">{summary.totalReceived} ETH</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Net Balance</div>
                  <div className="font-medium">{summary.netBalance} ETH</div>
                </div>
                <div className="pt-2 border-t border-cream/20">
                  <div className="flex justify-between items-center">
                    <div>Total Transactions</div>
                    <div className="font-medium">{summary.totalTransactions}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-4">Filter Transactions</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start border-cream/20 text-cream hover:bg-cream/10 rounded-xl"
                  onClick={() => setFilter("all")}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  All Transactions
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cream/20 text-cream hover:bg-cream/10 rounded-xl"
                  onClick={() => setFilter("send")}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Sent Only
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cream/20 text-cream hover:bg-cream/10 rounded-xl"
                  onClick={() => setFilter("receive")}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Received Only
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-cream/20 text-cream hover:bg-cream/10 rounded-xl"
                  onClick={() => setFilter("swap")}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Swaps Only
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}