"use client"
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  type: "send" | "receive" | "swap"
  status: "completed" | "pending" | "failed"
  amount: string
  currency: string
  toAmount?: string
  toCurrency?: string
  address: string
  date: string
  time: string
}

const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    type: "receive",
    status: "completed",
    amount: "0.25",
    currency: "BTC",
    address: "0x1a2b...3c4d",
    date: "Apr 4, 2023",
    time: "08:15 AM",
  },
  {
    id: "tx2",
    type: "send",
    status: "completed",
    amount: "0.5",
    currency: "ETH",
    address: "0x5e6f...7g8h",
    date: "Apr 2, 2023",
    time: "02:45 PM",
  },
  {
    id: "tx3",
    type: "swap",
    status: "completed",
    amount: "1.2",
    currency: "ETH",
    toAmount: "1800",
    toCurrency: "USDT",
    address: "Swap",
    date: "Mar 28, 2023",
    time: "11:30 AM",
  },
  {
    id: "tx4",
    type: "send",
    status: "pending",
    amount: "0.1",
    currency: "BTC",
    address: "0x9i0j...1k2l",
    date: "Mar 25, 2023",
    time: "04:20 PM",
  },
]

interface TransactionListProps {
  extended?: boolean
  filter?: string
  search?: string
}

export function TransactionList({ extended = false, filter = "all", search = "" }: TransactionListProps) {
  const filteredTransactions = mockTransactions.filter((tx) => {
    // Apply filter
    if (filter !== "all" && tx.type !== filter) return false

    // Apply search
    if (
      search &&
      !tx.address.toLowerCase().includes(search.toLowerCase()) &&
      !tx.amount.includes(search) &&
      !tx.currency.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }

    return true
  })

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-mauve">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredTransactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-3 hover:bg-cream/50 rounded-xl transition-colors"
        >
          <div className="flex items-center">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                tx.type === "receive" ? "bg-green-100" : tx.type === "send" ? "bg-red-100" : "bg-blue-100"
              }`}
            >
              {tx.type === "receive" && <ArrowDownLeft className={`h-5 w-5 text-green-600`} />}
              {tx.type === "send" && <ArrowUpRight className={`h-5 w-5 text-red-600`} />}
              {tx.type === "swap" && <RefreshCw className={`h-5 w-5 text-blue-600`} />}
            </div>
            <div>
              <div className="font-medium text-dark-brown">
                {tx.type === "receive" ? "Received" : tx.type === "send" ? "Sent" : "Swapped"}
              </div>
              <div className="text-sm text-mauve">
                {tx.date} • {tx.time}
              </div>
              {extended && <div className="text-sm text-mauve">{tx.address}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-dark-brown">
              {tx.type === "receive" ? "+" : "-"}
              {tx.amount} {tx.currency}
              {tx.type === "swap" && ` → ${tx.toAmount} ${tx.toCurrency}`}
            </div>
            <div className="flex justify-end mt-1">
              <Badge
                variant={tx.status === "completed" ? "outline" : tx.status === "pending" ? "secondary" : "destructive"}
                className={tx.status === "completed" ? "border-green-500 text-green-500" : ""}
              >
                {tx.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
