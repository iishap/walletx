"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const API_URL = "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter()
  const [walletName, setWalletName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    // Form validation
    if (!walletName || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // First, check if accounts exist by fetching the list
      const accountsResponse = await fetch(`${API_URL}/api/wallet/accounts`)
      const accountsData = await accountsResponse.json()
      
      if (!accountsResponse.ok) {
        throw new Error(accountsData.message || 'Failed to fetch wallet accounts')
      }
      
      // If no accounts found, show error
      if (!accountsData.accounts || accountsData.accounts.length === 0) {
        setError("No wallet found. Please create or import a wallet first.")
        setIsLoading(false)
        return
      }
      
      // Verify the password by attempting to get private key (common operation that requires password)
      const verifyResponse = await fetch(`${API_URL}/api/wallet/private-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })
      
      const verifyData = await verifyResponse.json()
      
      if (!verifyResponse.ok) {
        // If password verification fails
        setError(verifyData.message || 'Invalid password. Please try again.')
        setIsLoading(false)
        return
      }
      
      // If the wallet name is provided, verify it matches a wallet in the system
      if (walletName) {
        const walletExists = accountsData.accounts.some(
          account => account.name && account.name.toLowerCase() === walletName.toLowerCase()
        )
        
        if (!walletExists) {
          setError(`Wallet "${walletName}" not found. Please check the name and try again.`)
          setIsLoading(false)
          return
        }
        
        // Optionally switch to the specified wallet account if it's not the current one
        const targetAccount = accountsData.accounts.find(
          account => account.name && account.name.toLowerCase() === walletName.toLowerCase()
        )
        
        if (targetAccount && !targetAccount.isActive) {
          const switchResponse = await fetch(`${API_URL}/api/wallet/switch-account`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: targetAccount.address })
          })
          
          if (!switchResponse.ok) {
            // Non-critical error, we can still proceed to dashboard
            console.error('Failed to switch to the selected wallet account')
          }
        }
      }
      
      // If everything is successful, store auth info in session/local storage
      localStorage.setItem('walletAuthenticated', 'true')
      
      // Also store wallet name for welcome message if available 
      if (walletName) {
        localStorage.setItem('currentWalletName', walletName)
      } else {
        // Get the active wallet name
        const activeWallet = accountsData.accounts.find(account => account.isActive)
        if (activeWallet && activeWallet.name) {
          localStorage.setItem('currentWalletName', activeWallet.name)
        }
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-dark-brown hover:text-mauve hover:bg-cream"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main login card */}
          <div className="bg-white rounded-3xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-dark-brown mb-6">Login to Your Wallet</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wallet-name" className="text-dark-brown">
                  Wallet Name
                </Label>
                <div className="relative">
                  <Input
                    id="wallet-name"
                    value={walletName}
                    onChange={(e) => {
                      setWalletName(e.target.value)
                      setError("")
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="My Wallet"
                    className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-dark-brown">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 text-mauve hover:text-dark-brown"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}

              <Button 
                className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12" 
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Login"}
              </Button>

              <div className="text-center text-mauve">
                Don&apos;t have a wallet?{" "}
                <Button asChild variant="link" className="p-0 text-brown">
                  <Link href="/">Create or Import</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative card */}
          <div className="hidden md:flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-8 shadow-md text-cream flex-1">
              <h3 className="text-2xl font-bold mb-4">Welcome Back</h3>
              <p className="text-cream/80 mb-6">Access your digital assets securely with Elemental Wallet</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cream/30"></div>
                <div className="w-3 h-3 rounded-full bg-cream/60"></div>
                <div className="w-3 h-3 rounded-full bg-cream"></div>
              </div>
            </div>

            <div className="bg-brown rounded-3xl p-8 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-2">Security First</h3>
              <p className="text-cream/80">Your assets are protected with advanced encryption technology</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}