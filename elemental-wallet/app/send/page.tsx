"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, Send, Clock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { WalletHeader } from "@/components/wallet-header"

// Update the API_URL to match your backend server location
// You might need to adjust this based on your deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function SendPage() {
  const router = useRouter()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("MATIC")
  const [network, setNetwork] = useState("ethereum")
  const [gasOption, setGasOption] = useState("average")
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState("")
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [networks, setNetworks] = useState([])
  const [availableTokens, setAvailableTokens] = useState([])
  const [nativeBalance, setNativeBalance] = useState(0)
  const [gasEstimate, setGasEstimate] = useState({
    slow: { fee: "0.0001", timeEstimate: "~30 min" },
    average: { fee: "0.0005", timeEstimate: "~5 min" },
    fast: { fee: "0.001", timeEstimate: "~1 min" }
  })
  const [recentRecipients, setRecentRecipients] = useState([
    { name: "John's Wallet", address: "0x1a2b...3c4d" },
    { name: "Exchange Account", address: "0x5e6f...7g8h" }
  ])

  // Fetch networks on page load
  useEffect(() => {
    fetchNetworks()
    fetchTokens()
  }, [])

  // When network changes, fetch the balance for that network
  useEffect(() => {
    if (network) {
      fetchBalance()
    }
  }, [network])

  // Fetch networks from the API
  const fetchNetworks = async () => {
    try {
      setError("")
      const response = await fetch(`${API_URL}/api/blockchain/networks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add credentials if needed for authentication
        // credentials: 'include',
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Network fetch error:', errorText)
        throw new Error('Failed to fetch networks')
      }
      
      const data = await response.json()
      console.log('Fetched networks:', data)
      
      setNetworks(data.networks || [])
      if (data.networks && data.networks.length > 0) {
        setNetwork(data.networks[0].id)
      }
    } catch (error) {
      console.error('Error fetching networks:', error)
      setError('Failed to load networks. Please check your connection and try again.')
    }
  }

  // Fetch tokens from the API
  const fetchTokens = async () => {
    try {
      setError("")
      const response = await fetch(`${API_URL}/api/blockchain/tokens`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add credentials if needed for authentication
        // credentials: 'include',
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Token fetch error:', errorText)
        throw new Error('Failed to fetch tokens')
      }
      
      const data = await response.json()
      console.log('Fetched tokens:', data)
      setAvailableTokens(data.tokens || [])
    } catch (error) {
      console.error('Error fetching tokens:', error)
      setError('Failed to load tokens. Please check your connection and try again.')
    }
  }

  // Fetch account balance with improved error handling
  const fetchBalance = async () => {
    if (!network) return
    
    try {
      setError("")
      console.log(`Fetching balance for network: ${network}`)
      
      const response = await fetch(`${API_URL}/api/blockchain/balance?network=${encodeURIComponent(network)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add credentials if needed for authentication
        // credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Balance fetch error:', errorText)
        throw new Error('Failed to fetch balance')
      }
      
      const data = await response.json();
      console.log('Fetched balance:', data)
      setNativeBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Don't show error to user as this is not critical
    }
  };
  
  // When currency or recipient changes, update the gas estimate
  useEffect(() => {
    if (recipient && amount && Number(amount) > 0) {
      // Debounce gas estimation to prevent too many requests
      const timer = setTimeout(() => {
        estimateGasFee()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [currency, recipient, amount, network])

  // Estimate gas fee for the transaction with improved error handling
  const estimateGasFee = async () => {
    try {
      setError("")
      // For debugging
      console.log("Starting gas estimation with:", { recipient, amount, currency, network })
      
      // Validate inputs
      if (!recipient || !recipient.startsWith('0x') || recipient.length < 42) {
        console.error('Invalid recipient address')
        throw new Error('Please enter a valid wallet address')
      }
      
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        console.error('Invalid amount')
        throw new Error('Please enter a valid amount')
      }
      
      const isNativeToken = currency === "ETH" || currency === "MATIC" 
      
      let endpoint = isNativeToken 
        ? `${API_URL}/api/blockchain/gas/native`
        : `${API_URL}/api/blockchain/gas/token`
        
      console.log("Using endpoint:", endpoint)
      
      let tokenAddress = null
      if (!isNativeToken) {
        const token = availableTokens.find(token => token.symbol.toUpperCase() === currency.toUpperCase())
        tokenAddress = token?.address
        
        if (!tokenAddress) {
          console.error('Token address not found for', currency)
          throw new Error(`Token address not found for ${currency}`)
        }
      }

      const requestBody = isNativeToken
        ? {
            toAddress: recipient,
            amount: amount,
            network: network
          }
        : {
            tokenAddress: tokenAddress,
            toAddress: recipient,
            amount: amount,
            network: network,
            tokenName: currency
          }
      
      console.log("Request payload:", JSON.stringify(requestBody))

      // Add better error handling with longer timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        
        
        
        clearTimeout(timeoutId)
        
        console.log("Response status:", response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          throw new Error(`Failed to estimate gas fee: ${response.status} ${errorText}`)
        }
        
        const data = await response.json()
        console.log("Gas estimation data:", data)
        
        // Update gas estimates based on API response
        setGasEstimate({
          slow: { 
            fee: data.slowFee || "0.0001", 
            timeEstimate: "~30 min" 
          },
          average: { 
            fee: data.averageFee || "0.0005", 
            timeEstimate: "~5 min" 
          },
          fast: { 
            fee: data.fastFee || "0.001", 
            timeEstimate: "~1 min" 
          }
        })
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          console.error('Request timed out')
          throw new Error('Gas estimation request timed out. The network might be congested.')
        }
        throw fetchError
      }
    } catch (error) {
      console.error('Error estimating gas fee:', error)
      setError(error.message || 'Failed to estimate transaction fee. Please try again.')
      
      // Set fallback values when estimation fails
      setGasEstimate({
        slow: { fee: "0.0001", timeEstimate: "~30 min" },
        average: { fee: "0.0005", timeEstimate: "~5 min" },
        fast: { fee: "0.001", timeEstimate: "~1 min" }
      })
    }
  }

  // Handle send transaction with improved error handling
  const handleSend = async () => {
    if (step === 1) {
      // Validate inputs before moving to confirmation step
      if (!recipient || !recipient.startsWith('0x')) {
        setError('Please enter a valid wallet address')
        return
      }
      
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError('Please enter a valid amount')
        return
      }
      
      setError("")
      setStep(2)
      return
    }
    
    try {
      setIsLoading(true)
      setError("")
      
      if (!password) {
        throw new Error('Please enter your wallet password')
      }
      
      const isNativeToken = currency === "ETH" || currency === "MATIC"
      
      // Fix the API endpoint paths to include the full URL
      let endpoint = isNativeToken 
        ? `${API_URL}/api/blockchain/transfer/native`
        : `${API_URL}/api/blockchain/token/transfer`
        
      let tokenAddress = null
      if (!isNativeToken) {
        const token = availableTokens.find(token => token.symbol.toUpperCase() === currency.toUpperCase())
        tokenAddress = token?.address
        
        if (!tokenAddress) {
          throw new Error(`Token address not found for ${currency}`)
        }
      }

      // Prepare gas settings based on the selected option
      const gasSettings = {
        gasOption: gasOption
      }

      const requestBody = isNativeToken
        ? {
            toAddress: recipient,
            amount: amount,
            password: password,
            network: network,
            ...gasSettings
          }
        : {
            tokenAddress: tokenAddress,
            toAddress: recipient,
            amount: amount,
            network: network,
            password: password,
            ...gasSettings
          }

      console.log("Sending transaction request to:", endpoint)
      console.log("Request payload (without password):", {
        ...requestBody,
        password: "[REDACTED]"
      })

      // Add timeout handling for transaction requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for transactions
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        })
        
        

        
        clearTimeout(timeoutId)
        
        // Handle non-JSON responses gracefully
        let data
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          const text = await response.text()
          data = { message: text }
        }

        if (!response.ok) {
          throw new Error(data.message || `Transaction failed with status ${response.status}`)
        }
        
        setSuccess(`Transaction sent successfully! Transaction hash: ${data.txHash}`)
        
        // Save recipient to recent recipients
        const recipientName = recipient.substring(0, 6) + '...' + recipient.substring(recipient.length - 4)
        setRecentRecipients(prev => [
          { name: recipientName, address: recipient },
          ...prev.filter(r => r.address !== recipient).slice(0, 4) // Keep only the 5 most recent, avoid duplicates
        ])
        
        // Wait a bit before redirecting to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('Transaction request timed out. The network might be congested.')
        }
        throw fetchError
      }
    } catch (error) {
      console.error('Error sending transaction:', error)
      setError(error.message || 'Failed to send transaction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetMaxAmount = () => {
    if (nativeBalance > 0) {
      // For native tokens, subtract the gas fee
      if (currency === "ETH" || currency === "MATIC") {
        const gasFee = Number(gasEstimate[gasOption]?.fee || 0)
        const maxAmount = Math.max(0, nativeBalance - gasFee).toFixed(6)
        setAmount(maxAmount)
      } else {
        // For non-native tokens, we can use the full balance
        setAmount(nativeBalance.toFixed(6))
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <WalletHeader />

      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8">
        <Button
          variant="ghost"
          className="mb-4 text-dark-brown hover:text-mauve hover:bg-cream"
          onClick={() => (step === 1 ? router.push("/dashboard") : setStep(1))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 1 ? "Back to Dashboard" : "Back to Form"}
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            {step === 1 ? (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-6">Send Crypto</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="recipient" className="text-dark-brown">
                      Recipient Address
                    </Label>
                    <div className="flex">
                      <Input
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter wallet address"
                        className="rounded-l-xl bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve"
                      />
                      <Button
                        variant="outline"
                        className="rounded-r-xl border-mauve/10 text-mauve hover:text-cream hover:bg-mauve"
                      >
                        <QrCode className="h-4 w-4" />
                        <span className="sr-only">Scan QR Code</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-dark-brown">
                        Currency
                      </Label>
                      <Select defaultValue={currency} onValueChange={setCurrency}>
                        <SelectTrigger
                          id="currency"
                          className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        >
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-mauve/10">
                          <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                          {availableTokens.map(token => (
                            <SelectItem key={token.address} value={token.symbol}>
                              {token.name} ({token.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="network" className="text-dark-brown">
                        Network
                      </Label>
                      <Select defaultValue={network} onValueChange={setNetwork}>
                        <SelectTrigger
                          id="network"
                          className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        >
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-mauve/10">
                          {networks.length > 0 ? (
                            networks.map(net => (
                              <SelectItem key={net.id} value={net.id}>
                                {net.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>
                              Loading networks...
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="amount" className="text-dark-brown">
                        Amount
                      </Label>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-mauve"
                        onClick={handleSetMaxAmount}
                      >
                        Max
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                      />
                      <div className="text-sm font-medium text-dark-brown">{currency}</div>
                    </div>
                    <div className="text-sm text-mauve">
                      ≈ $
                      {currency === "MATIC"
                        ? (Number.parseFloat(amount || "0") * 18000).toFixed(2)
                        : (Number.parseFloat(amount || "0") * 1800).toFixed(2)}{" "}
                      USD
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-dark-brown">Transaction Speed</Label>
                    <RadioGroup
                      defaultValue={gasOption}
                      onValueChange={setGasOption}
                      className="flex flex-col sm:flex-row bg-cream p-2 rounded-xl"
                    >
                      <div className="flex items-center space-x-2 flex-1 p-2 rounded-lg hover:bg-mauve/10">
                        <RadioGroupItem value="slow" id="slow" className="text-mauve" />
                        <Label htmlFor="slow" className="flex-1 cursor-pointer">
                          <div className="text-dark-brown">Slow</div>
                          <div className="text-xs text-mauve">{gasEstimate.slow.timeEstimate}</div>
                          <div className="text-xs text-mauve">Fee: {gasEstimate.slow.fee} {currency}</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1 p-2 rounded-lg hover:bg-mauve/10">
                        <RadioGroupItem value="average" id="average" className="text-mauve" />
                        <Label htmlFor="average" className="flex-1 cursor-pointer">
                          <div className="text-dark-brown">Average</div>
                          <div className="text-xs text-mauve">{gasEstimate.average.timeEstimate}</div>
                          <div className="text-xs text-mauve">Fee: {gasEstimate.average.fee} {currency}</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1 p-2 rounded-lg hover:bg-mauve/10">
                        <RadioGroupItem value="fast" id="fast" className="text-mauve" />
                        <Label htmlFor="fast" className="flex-1 cursor-pointer">
                          <div className="text-dark-brown">Fast</div>
                          <div className="text-xs text-mauve">{gasEstimate.fast.timeEstimate}</div>
                          <div className="text-xs text-mauve">Fee: {gasEstimate.fast.fee} {currency}</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12"
                    onClick={handleSend}
                    disabled={!recipient || !amount || Number.parseFloat(amount) <= 0}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-6">Confirm Transaction</h2>
                <div className="space-y-6">
                  <div className="bg-cream p-6 rounded-xl space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm text-mauve">Sending</div>
                      <div className="text-2xl font-medium text-dark-brown">
                        {amount} {currency}
                      </div>
                      <div className="text-sm text-mauve">
                        ≈ $
                        {currency === "MATIC"
                          ? (Number.parseFloat(amount) * 18000).toFixed(2)
                          : (Number.parseFloat(amount) * 1800).toFixed(2)}{" "}
                        USD
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-mauve">To</div>
                      <div className="text-sm font-medium text-dark-brown break-all">{recipient}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-mauve">Network</div>
                      <div className="text-sm font-medium text-dark-brown">
                        {networks.find(net => net.id === network)?.name || network}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm text-mauve">Network Fee</div>
                      <div className="text-sm font-medium text-dark-brown">
                        {gasEstimate[gasOption].fee} {currency}
                      </div>
                      <div className="text-xs text-mauve">
                        ≈ $
                        {currency === "MATIC"
                          ? (Number.parseFloat(gasEstimate[gasOption].fee) * 18000).toFixed(2)
                          : (Number.parseFloat(gasEstimate[gasOption].fee) * 1800).toFixed(2)}{" "}
                        USD
                      </div>
                    </div>

                    <div className="pt-2 border-t border-mauve/10">
                      <div className="flex justify-between">
                        <div className="text-sm font-medium text-dark-brown">Total Amount</div>
                        <div className="text-sm font-medium text-dark-brown">
                          {(
                            Number.parseFloat(amount) +
                            Number.parseFloat(gasEstimate[gasOption].fee)
                          ).toFixed(6)}{" "}
                          {currency}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-dark-brown">
                        Wallet Password
                      </Label>
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your wallet password"
                        className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                      />
                      <div className="flex justify-end">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-mauve"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? 'Hide' : 'Show'} password
                        </Button>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12" 
                      onClick={handleSend}
                      disabled={isLoading || !password}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-cream border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send {amount} {currency}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <Send className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Sending Tips</h3>
              <ul className="space-y-2 text-sm text-cream/80">
                <li>• Double-check the recipient address</li>
                <li>• Verify the amount before sending</li>
                <li>• Transactions cannot be reversed</li>
                <li>• Higher fees mean faster confirmations</li>
              </ul>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <Clock className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Recent Recipients</h3>
              <div className="space-y-3 mt-4">
                {recentRecipients.map((recipient, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-cream/10 rounded-lg hover:bg-cream/20 cursor-pointer"
                    onClick={() => setRecipient(recipient.address)}
                  >
                    <div className="font-medium">{recipient.name}</div>
                    <div className="text-xs text-cream/80">{recipient.address}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}