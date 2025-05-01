"use client"

import type React from "react"

import { useState } from "react"
import { Check, ChevronDown, Edit2, Plus, Trash2, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export function AccountSwitcher() {
  const { accounts, activeAccount, setActiveAccount, addAccount, renameAccount, deleteAccount } = useAccounts()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [accountToRename, setAccountToRename] = useState<WalletAccount | null>(null)

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      addAccount(newAccountName.trim())
      setNewAccountName("")
      setIsCreateDialogOpen(false)
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

  const openRenameDialog = (account: WalletAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setAccountToRename(account)
    setNewAccountName(account.name)
    setIsRenameDialogOpen(true)
  }

  const handleDeleteAccount = (account: WalletAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    if (accounts.length > 1) {
      deleteAccount(account.id)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex justify-between items-center w-full border-mauve/10 text-dark-brown hover:bg-mauve/10 rounded-xl h-12"
          >
            <div className="flex items-center">
              <Wallet className="mr-2 h-5 w-5 text-mauve" />
              <span className="font-medium">{activeAccount?.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-mauve" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px] bg-cream border-mauve/10">
          <div className="p-2">
            <p className="text-xs text-mauve mb-2">Your Accounts</p>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.id}
                className="flex items-center justify-between rounded-lg cursor-pointer p-2 hover:bg-mauve/10"
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
                {activeAccount?.id === account.id && <Check className="h-4 w-4 text-mauve" />}
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-mauve hover:text-dark-brown"
                    onClick={(e) => openRenameDialog(account, e)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  {accounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-mauve hover:text-red-500"
                      onClick={(e) => handleDeleteAccount(account, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator className="bg-mauve/10" />
          <DropdownMenuItem
            className="flex items-center rounded-lg cursor-pointer p-2 hover:bg-mauve/10 text-mauve"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
