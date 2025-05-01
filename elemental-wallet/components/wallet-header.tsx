"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Check, ChevronDown, LogOut, Menu, Plus, Settings, User, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { useAccounts } from "@/contexts/account-context"

export function WalletHeader() {
  const [notificationCount] = useState(3)
  const { accounts, activeAccount, setActiveAccount, addAccount } = useAccounts()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const calculateTotalBalance = (account: any) => {
    // Mock conversion rates
    const rates = {
      BTC: 18000,
      ETH: 1800,
      USDT: 1,
      USDC: 1,
    }

    return Object.entries(account.balance).reduce((total, [currency, amount]) => {
      return total + (amount as number) * rates[currency as keyof typeof rates]
    }, 0)
  }

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      addAccount(newAccountName.trim())
      setNewAccountName("")
      setIsCreateDialogOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mauve/10 bg-cream">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-dark-brown">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] bg-cream border-mauve/10">
              <div className="mb-4 pb-4 border-b border-mauve/10">
                <p className="text-xs text-mauve mb-2">Current Account</p>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-mauve/20 flex items-center justify-center mr-2">
                    <Wallet className="h-4 w-4 text-mauve" />
                  </div>
                  <div>
                    <div className="font-medium text-dark-brown">{activeAccount?.name}</div>
                    <div className="text-xs text-mauve">{formatAddress(activeAccount?.address || "")}</div>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {accounts
                    .filter((acc) => acc.id !== activeAccount?.id)
                    .map((account) => (
                      <button
                        key={account.id}
                        className="flex items-center w-full p-2 rounded-lg hover:bg-mauve/10 text-left"
                        onClick={() => {
                          setActiveAccount(account)
                          // Close the sheet after selecting an account
                          document.body.click()
                        }}
                      >
                        <div className="h-6 w-6 rounded-full bg-mauve/10 flex items-center justify-center mr-2">
                          <Wallet className="h-3 w-3 text-mauve" />
                        </div>
                        <span className="text-sm text-dark-brown">{account.name}</span>
                      </button>
                    ))}
                  <button
                    className="flex items-center w-full p-2 rounded-lg hover:bg-mauve/10 text-left text-mauve"
                    onClick={() => {
                      // Close the sheet
                      document.body.click()
                      // Open the create account dialog
                      setIsCreateDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-sm">Create New Account</span>
                  </button>
                </div>
              </div>
              <nav className="flex flex-col gap-4 pt-4">
                <Link href="/dashboard" className="text-lg font-medium text-dark-brown">
                  Dashboard
                </Link>
                <Link href="/send" className="text-lg font-medium text-dark-brown">
                  Send
                </Link>
                <Link href="/receive" className="text-lg font-medium text-dark-brown">
                  Receive
                </Link>
                <Link href="/swap" className="text-lg font-medium text-dark-brown">
                  Swap
                </Link>
                <Link href="/activity" className="text-lg font-medium text-dark-brown">
                  Activity
                </Link>
                <Link href="/settings" className="text-lg font-medium text-dark-brown">
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-dark-brown">Elemental Wallet</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-dark-brown hover:text-mauve transition-colors">
            Dashboard
          </Link>
          <Link href="/send" className="text-sm font-medium text-dark-brown hover:text-mauve transition-colors">
            Send
          </Link>
          <Link href="/receive" className="text-sm font-medium text-dark-brown hover:text-mauve transition-colors">
            Receive
          </Link>
          <Link href="/swap" className="text-sm font-medium text-dark-brown hover:text-mauve transition-colors">
            Swap
          </Link>
          <Link href="/activity" className="text-sm font-medium text-dark-brown hover:text-mauve transition-colors">
            Activity
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {/* MetaMask-style account switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center mr-2 bg-mauve/10 px-3 py-1 rounded-full hover:bg-mauve/20"
              >
                <div className="h-5 w-5 rounded-full bg-mauve/20 flex items-center justify-center mr-2">
                  <Wallet className="h-3 w-3 text-mauve" />
                </div>
                <span className="text-xs font-medium text-dark-brown">{activeAccount?.name}</span>
                <ChevronDown className="h-3 w-3 ml-1 text-mauve" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] bg-cream border-mauve/10">
              <div className="p-3">
                <h4 className="text-sm font-medium text-dark-brown mb-2">My Accounts</h4>
                <div className="space-y-1 max-h-[300px] overflow-y-auto">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                        activeAccount?.id === account.id ? "bg-mauve/10" : "hover:bg-mauve/5"
                      }`}
                      onClick={() => setActiveAccount(account)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-mauve/20 flex items-center justify-center mr-2">
                          <Wallet className="h-4 w-4 text-mauve" />
                        </div>
                        <div>
                          <div className="font-medium text-dark-brown">{account.name}</div>
                          <div className="text-xs text-mauve">{formatAddress(account.address)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-2">
                          <div className="text-sm font-medium text-dark-brown">
                            ${calculateTotalBalance(account).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                        {activeAccount?.id === account.id && (
                          <div className="h-5 w-5 rounded-full bg-mauve flex items-center justify-center">
                            <Check className="h-3 w-3 text-cream" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator className="bg-mauve/10" />
              <DropdownMenuItem
                className="flex items-center justify-center p-2 cursor-pointer hover:bg-mauve/5"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4 text-mauve" />
                <span className="text-mauve">Add Account</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="relative text-dark-brown">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-mauve text-[10px] font-medium text-cream">
                {notificationCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-dark-brown">
                <User className="h-5 w-5" />
                <span className="hidden md:inline-flex">Settings</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-cream border-mauve/10">
              <DropdownMenuItem asChild className="text-dark-brown focus:bg-mauve/10 focus:text-dark-brown">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-mauve/10" />
              <DropdownMenuItem asChild className="text-dark-brown focus:bg-mauve/10 focus:text-dark-brown">
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-cream border-mauve/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-dark-brown">Create New Account</DialogTitle>
            <DialogDescription className="text-mauve">
              Add a new wallet account to manage your assets separately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-dark-brown">
                Account Name
              </Label>
              <Input
                id="name"
                placeholder="Enter account name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAccount}
              className="bg-mauve hover:bg-brown text-cream rounded-xl"
              disabled={!newAccountName.trim()}
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
