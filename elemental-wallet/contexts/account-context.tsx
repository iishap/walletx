"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface WalletAccount {
  id: string
  name: string
  address: string
  balance: {
    BTC: number
    ETH: number
    USDT: number
    USDC: number
  }
  createdAt: Date
}

interface AccountContextType {
  accounts: WalletAccount[]
  activeAccount: WalletAccount | null
  setActiveAccount: (account: WalletAccount) => void
  addAccount: (name: string) => void
  renameAccount: (id: string, name: string) => void
  deleteAccount: (id: string) => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

// Sample data for demo purposes
const generateMockAddress = () => {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
}

const defaultAccounts: WalletAccount[] = [
  {
    id: "default",
    name: "Main Wallet",
    address: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
    balance: {
      BTC: 0.45,
      ETH: 2.5,
      USDT: 1000,
      USDC: 1000,
    },
    createdAt: new Date("2023-04-04"),
  },
]

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<WalletAccount[]>(defaultAccounts)
  const [activeAccount, setActiveAccount] = useState<WalletAccount | null>(defaultAccounts[0])

  // Load accounts from localStorage on initial render
  useEffect(() => {
    const savedAccounts = localStorage.getItem("walletAccounts")
    const savedActiveAccountId = localStorage.getItem("activeAccountId")

    if (savedAccounts) {
      try {
        // Parse the accounts and convert date strings back to Date objects
        const parsedAccounts = JSON.parse(savedAccounts, (key, value) => {
          if (key === "createdAt") {
            return new Date(value)
          }
          return value
        })

        setAccounts(parsedAccounts)

        if (savedActiveAccountId) {
          const activeAcc = parsedAccounts.find((acc: WalletAccount) => acc.id === savedActiveAccountId)
          if (activeAcc) {
            setActiveAccount(activeAcc)
          }
        } else if (parsedAccounts.length > 0) {
          setActiveAccount(parsedAccounts[0])
        }
      } catch (error) {
        console.error("Error loading accounts from localStorage:", error)
        // Fall back to default accounts
        setAccounts(defaultAccounts)
        setActiveAccount(defaultAccounts[0])
      }
    }
  }, [])

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("walletAccounts", JSON.stringify(accounts))
    if (activeAccount) {
      localStorage.setItem("activeAccountId", activeAccount.id)
    }
  }, [accounts, activeAccount])

  const addAccount = (name: string) => {
    const newAccount: WalletAccount = {
      id: `account-${Date.now()}`,
      name,
      address: generateMockAddress(),
      balance: {
        BTC: Math.random() * 0.5,
        ETH: Math.random() * 3,
        USDT: Math.random() * 1500,
        USDC: Math.random() * 1500,
      },
      createdAt: new Date(),
    }

    setAccounts((prev) => [...prev, newAccount])
    setActiveAccount(newAccount)
  }

  const renameAccount = (id: string, name: string) => {
    setAccounts((prev) => prev.map((account) => (account.id === id ? { ...account, name } : account)))

    if (activeAccount?.id === id) {
      setActiveAccount({ ...activeAccount, name })
    }
  }

  const deleteAccount = (id: string) => {
    // Prevent deleting the last account
    if (accounts.length <= 1) {
      return
    }

    setAccounts((prev) => prev.filter((account) => account.id !== id))

    // If the active account is deleted, switch to the first available account
    if (activeAccount?.id === id) {
      const remainingAccounts = accounts.filter((account) => account.id !== id)
      setActiveAccount(remainingAccounts[0])
    }
  }

  return (
    <AccountContext.Provider
      value={{
        accounts,
        activeAccount,
        setActiveAccount,
        addAccount,
        renameAccount,
        deleteAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccounts() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider")
  }
  return context
}
