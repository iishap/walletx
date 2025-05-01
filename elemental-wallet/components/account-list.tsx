"use client"

import { useState } from "react"
import { CreditCard, Edit2, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAccounts, type WalletAccount } from "@/contexts/account-context"

interface AccountListProps {
  isCreateDialogOpen?: boolean
  setIsCreateDialogOpen?: (isOpen: boolean) => void
}

export function AccountList({ isCreateDialogOpen, setIsCreateDialogOpen }: AccountListProps) {
  const { accounts, activeAccount, setActiveAccount, addAccount, renameAccount, deleteAccount } = useAccounts()
  const [localIsCreateDialogOpen, setLocalIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [accountToRename, setAccountToRename] = useState<WalletAccount | null>(null)

  // Use the provided state if available, otherwise use local state
  const dialogOpen = isCreateDialogOpen !== undefined ? isCreateDialogOpen : localIsCreateDialogOpen
  const setDialogOpen = setIsCreateDialogOpen || setLocalIsCreateDialogOpen

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      addAccount(newAccountName.trim())
      setNewAccountName("")
      setDialogOpen(false)
    }
  }

  const handleRenameAccount = () => {
    if (accountToRename && newAccountName.trim()) {
      renameAccount(accountToRename.id, newAccountName.trim())
      setNewAccountName("")
      setAccountToRename(null)
      setIsRenameDialogOpen(false)
    }
  }

  const openRenameDialog = (account: WalletAccount) => {
    setAccountToRename(account)
    setNewAccountName(account.name)
    setIsRenameDialogOpen(true)
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const calculateTotalBalance = (account: WalletAccount) => {
    // Mock conversion rates
    const rates = {
      BTC: 18000,
      ETH: 1800,
      USDT: 1,
      USDC: 1,
    }

    return Object.entries(account.balance).reduce((total, [currency, amount]) => {
      return total + amount * rates[currency as keyof typeof rates]
    }, 0)
  }

  return (
    <>
      <div className="bg-white rounded-3xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-dark-brown">Your Accounts</h3>
          <Button
            variant="outline"
            size="sm"
            className="border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Account
          </Button>
        </div>

        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer group ${
                activeAccount?.id === account.id
                  ? "bg-mauve/10 border border-mauve/20"
                  : "hover:bg-cream/70 border border-transparent"
              }`}
              onClick={() => setActiveAccount(account)}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-mauve/20 flex items-center justify-center mr-3">
                  <CreditCard className="h-5 w-5 text-mauve" />
                </div>
                <div>
                  <div className="font-medium text-dark-brown">{account.name}</div>
                  <div className="text-xs text-mauve">{formatAddress(account.address)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-3">
                  <div className="font-medium text-dark-brown">${calculateTotalBalance(account).toLocaleString()}</div>
                  <div className="text-xs text-mauve">{Object.keys(account.balance).length} assets</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-mauve opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-cream border-mauve/10">
                    <DropdownMenuItem
                      className="text-dark-brown focus:bg-mauve/10 focus:text-dark-brown cursor-pointer"
                      onClick={() => openRenameDialog(account)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    {accounts.length > 1 && (
                      <DropdownMenuItem
                        className="text-red-500 focus:bg-red-50 focus:text-red-500 cursor-pointer"
                        onClick={() => deleteAccount(account.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Account Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              onClick={() => setDialogOpen(false)}
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

      {/* Rename Account Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-cream border-mauve/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-dark-brown">Rename Account</DialogTitle>
            <DialogDescription className="text-mauve">Change the name of your wallet account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename" className="text-dark-brown">
                New Account Name
              </Label>
              <Input
                id="rename"
                placeholder="Enter new account name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              className="border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameAccount}
              className="bg-mauve hover:bg-brown text-cream rounded-xl"
              disabled={!newAccountName.trim()}
            >
              Rename Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
