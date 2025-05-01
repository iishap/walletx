"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Lock, User, Download, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ImportWalletPage() {
  const router = useRouter()
  const [importMethod, setImportMethod] = useState("phrase")
  const [walletName, setWalletName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phraseInputs, setPhraseInputs] = useState(Array(12).fill(""))
  const [privateKey, setPrivateKey] = useState("")
  const [error, setError] = useState("")

  const handlePhraseInputChange = (index: number, value: string) => {
    const newInputs = [...phraseInputs]
    newInputs[index] = value
    setPhraseInputs(newInputs)
    setError("")
  }

  const handleImportWallet = () => {
    // In a real app, we would validate the recovery phrase or private key
    // For this demo, we'll just check if all fields are filled
    if (importMethod === "phrase") {
      if (phraseInputs.some((word) => !word.trim())) {
        setError("Please fill in all recovery phrase words")
        return
      }
    } else {
      if (!privateKey.trim()) {
        setError("Please enter your private key")
        return
      }
    }

    if (!walletName || !password || password !== confirmPassword) {
      setError("Please fill in all required fields and ensure passwords match")
      return
    }

    // Proceed to dashboard
    router.push("/dashboard")
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-md">
              <h2 className="text-3xl font-bold text-dark-brown mb-6">Import Wallet</h2>

              <Tabs defaultValue="phrase" onValueChange={setImportMethod} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-cream">
                  <TabsTrigger value="phrase" className="data-[state=active]:bg-mauve data-[state=active]:text-cream">
                    Recovery Phrase
                  </TabsTrigger>
                  <TabsTrigger value="key" className="data-[state=active]:bg-mauve data-[state=active]:text-cream">
                    Private Key
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="phrase" className="mt-6">
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {phraseInputs.map((input, index) => (
                      <div key={index} className="space-y-1">
                        <Label htmlFor={`word-${index}`} className="text-xs text-mauve">
                          {index + 1}.
                        </Label>
                        <Input
                          id={`word-${index}`}
                          value={input}
                          onChange={(e) => handlePhraseInputChange(index, e.target.value)}
                          placeholder={`Word ${index + 1}`}
                          className="h-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="key" className="mt-6">
                  <div className="space-y-2 mb-6">
                    <Label htmlFor="private-key" className="text-dark-brown">
                      Private Key
                    </Label>
                    <Input
                      id="private-key"
                      value={privateKey}
                      onChange={(e) => {
                        setPrivateKey(e.target.value)
                        setError("")
                      }}
                      placeholder="Enter your private key"
                      className="bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-name" className="text-dark-brown">
                    Wallet Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="wallet-name"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="My Wallet"
                      className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-dark-brown">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 text-mauve hover:text-dark-brown"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-dark-brown">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>

              {error && <div className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}

              <Button
                className="w-full mt-6 bg-mauve hover:bg-brown text-cream rounded-xl h-12"
                onClick={handleImportWallet}
              >
                Import Wallet
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <Download className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Import Options</h3>
              <p className="text-cream/80 mb-4">
                You can import your wallet using either a 12-word recovery phrase or a private key.
              </p>
              <ul className="space-y-2 text-sm text-cream/80">
                <li>• Recovery phrase is the most common method</li>
                <li>• Private key works for individual accounts</li>
              </ul>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <Shield className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Security Tips</h3>
              <ul className="space-y-2 text-sm text-cream/80">
                <li>• Never share your recovery phrase or private key</li>
                <li>• Be careful of phishing websites</li>
                <li>• Use a strong, unique password</li>
                <li>• Enable two-factor authentication after import</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
