"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowLeft, RefreshCw, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

import { WalletHeader } from "@/components/wallet-header"

export default function SwapPage() {
  const router = useRouter()
  const [fromCurrency, setFromCurrency] = useState("BTC")
  const [toCurrency, setToCurrency] = useState("ETH")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [slippage, setSlippage] = useState(1)
  const [step, setStep] = useState(1)

  // Mock exchange rates
  const exchangeRates = {
    BTC: { ETH: 13.5, USDT: 18000, USDC: 18000 },
    ETH: { BTC: 0.074, USDT: 1800, USDC: 1800 },
    USDT: { BTC: 0.000055, ETH: 0.00055, USDC: 1 },
    USDC: { BTC: 0.000055, ETH: 0.00055, USDT: 1 },
  }

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value && !isNaN(Number.parseFloat(value))) {
      const rate =
        exchangeRates[fromCurrency as keyof typeof exchangeRates][
          toCurrency as keyof (typeof exchangeRates)[typeof fromCurrency]
        ]
      setToAmount((Number.parseFloat(value) * rate).toFixed(6))
    } else {
      setToAmount("")
    }
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    if (value && !isNaN(Number.parseFloat(value))) {
      const rate =
        1 /
        exchangeRates[fromCurrency as keyof typeof exchangeRates][
          toCurrency as keyof (typeof exchangeRates)[typeof fromCurrency]
        ]
      setFromAmount((Number.parseFloat(value) * rate).toFixed(6))
    } else {
      setFromAmount("")
    }
  }

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)

    // Recalculate amounts
    if (fromAmount) {
      const rate =
        exchangeRates[toCurrency as keyof typeof exchangeRates][
          fromCurrency as keyof (typeof exchangeRates)[typeof toCurrency]
        ]
      setToAmount((Number.parseFloat(fromAmount) * rate).toFixed(6))
    }
  }

  const handleSwap = () => {
    if (step === 1) {
      setStep(2)
    } else {
      // In a real app, we would execute the swap
      // For this demo, we'll just go back to the dashboard
      router.push("/dashboard")
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            {step === 1 ? (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-6">Swap Crypto</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-dark-brown">From</Label>
                    <div className="flex space-x-2">
                      <Select defaultValue={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="w-[120px] bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-mauve/10">
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={fromAmount}
                        onChange={(e) => handleFromAmountChange(e.target.value)}
                        placeholder="0.00"
                        className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                      />
                    </div>
                    <div className="text-xs text-right text-mauve">Balance: 0.45 {fromCurrency}</div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full border-mauve/10 text-mauve hover:text-cream hover:bg-mauve"
                      onClick={handleSwapCurrencies}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-dark-brown">To</Label>
                    <div className="flex space-x-2">
                      <Select defaultValue={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="w-[120px] bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-mauve/10">
                          <SelectItem value="Polygon">Polygon</SelectItem>
                          <SelectItem value="Arbitrum">Arbitrum</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={toAmount}
                        onChange={(e) => handleToAmountChange(e.target.value)}
                        placeholder="0.00"
                        className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                      />
                    </div>
                    <div className="text-xs text-right text-mauve">Balance: 2.5 {toCurrency}</div>
                  </div>

                  <div className="pt-4 bg-cream p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-dark-brown">Slippage Tolerance</Label>
                      <div className="text-sm font-medium text-mauve">{slippage}%</div>
                    </div>
                    <Slider
                      defaultValue={[1]}
                      max={5}
                      step={0.1}
                      onValueChange={(value) => setSlippage(value[0])}
                      className="[&>span]:bg-mauve"
                    />
                    <div className="flex justify-between text-xs text-mauve mt-1">
                      <span>0.1%</span>
                      <span>5%</span>
                    </div>

                    <div className="space-y-2 pt-4 mt-4 border-t border-mauve/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-brown">Rate</span>
                        <span className="text-dark-brown">
                          1 {fromCurrency} ={" "}
                          {
                            exchangeRates[fromCurrency as keyof typeof exchangeRates][
                              toCurrency as keyof (typeof exchangeRates)[typeof fromCurrency]
                            ]
                          }{" "}
                          {toCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-brown">Fee</span>
                        <span className="text-dark-brown">0.3%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-brown">Minimum Received</span>
                        <span className="text-dark-brown">
                          {toAmount ? (Number.parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6) : "0"}{" "}
                          {toCurrency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12"
                    onClick={handleSwap}
                    disabled={!fromAmount || Number.parseFloat(fromAmount) <= 0}
                  >
                    Review Swap
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-6">Confirm Swap</h2>
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-6 bg-cream p-8 rounded-xl">
                    <div className="text-center">
                      <div className="text-sm text-mauve">You Pay</div>
                      <div className="text-3xl font-bold text-dark-brown">
                        {fromAmount} {fromCurrency}
                      </div>
                    </div>

                    <div className="bg-mauve rounded-full p-2">
                      <ArrowDown className="h-6 w-6 text-cream" />
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-mauve">You Receive</div>
                      <div className="text-3xl font-bold text-dark-brown">
                        {toAmount} {toCurrency}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-mauve/10">
                    <div className="flex justify-between text-sm pt-4">
                      <span className="text-dark-brown">Rate</span>
                      <span className="text-dark-brown">
                        1 {fromCurrency} ={" "}
                        {
                          exchangeRates[fromCurrency as keyof typeof exchangeRates][
                            toCurrency as keyof (typeof exchangeRates)[typeof fromCurrency]
                          ]
                        }{" "}
                        {toCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-brown">Fee</span>
                      <span className="text-dark-brown">
                        {(Number.parseFloat(fromAmount) * 0.003).toFixed(6)} {fromCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-brown">Slippage Tolerance</span>
                      <span className="text-dark-brown">{slippage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-brown">Minimum Received</span>
                      <span className="text-dark-brown">
                        {(Number.parseFloat(toAmount) * (1 - slippage / 100)).toFixed(6)} {toCurrency}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12" onClick={handleSwap}>
                    Confirm Swap
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <RefreshCw className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Swap Information</h3>
              <p className="text-cream/80 mb-4">Swap your cryptocurrencies instantly at competitive rates.</p>
              <ul className="space-y-2 text-sm text-cream/80">
                <li>• Trades execute at the current market rate</li>
                <li>• Slippage tolerance protects your trade</li>
                <li>• 0.3% fee on all swaps</li>
              </ul>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <TrendingUp className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Market Rates</h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <div>BTC/ETH</div>
                  <div className="font-medium">13.5</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>ETH/USDT</div>
                  <div className="font-medium">1,800</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>BTC/USDT</div>
                  <div className="font-medium">18,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
