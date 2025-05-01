"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { WalletHeader } from "@/components/wallet-header"
import { TransactionList } from "@/components/transaction-list"

export default function ActivityPage() {
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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
                  <TabsTrigger value="activity" className="data-[state=active]:bg-mauve data-[state=active]:text-cream">
                    Wallet Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="pt-6">
                  <TransactionList extended filter={filter} search={searchTerm} />
                </TabsContent>

                <TabsContent value="activity" className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-cream rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium text-dark-brown">Wallet Created</div>
                        <div className="text-sm text-mauve">Apr 4, 2023 • 08:15 AM</div>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-cream rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium text-dark-brown">Password Changed</div>
                        <div className="text-sm text-mauve">Jun 12, 2023 • 02:45 PM</div>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-cream rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium text-dark-brown">Recovery Phrase Viewed</div>
                        <div className="text-sm text-mauve">Aug 23, 2023 • 11:30 AM</div>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-cream rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium text-dark-brown">Connected to DApp</div>
                        <div className="text-sm text-mauve">Oct 5, 2023 • 04:20 PM</div>
                        <div className="text-sm text-mauve">app.uniswap.org</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                variant="outline"
                className="w-full border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Transaction History
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
                  <div className="font-medium">0.6 BTC</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Total Received</div>
                  <div className="font-medium">0.75 BTC</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Net Balance</div>
                  <div className="font-medium">+0.15 BTC</div>
                </div>
                <div className="pt-2 border-t border-cream/20">
                  <div className="flex justify-between items-center">
                    <div>Total Transactions</div>
                    <div className="font-medium">24</div>
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
