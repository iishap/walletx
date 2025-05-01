"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, Eye, EyeOff, Lock, Shield, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const API_URL = "http://localhost:3000";

export default function CreateWalletPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [walletName, setWalletName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [recoveryPhrase, setRecoveryPhrase] = useState("")
  const [phraseInputs, setPhraseInputs] = useState(Array(12).fill(""))
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Calculate password strength
  const calculateStrength = (pass: string) => {
    let strength = 0
    if (pass.length > 6) strength += 25
    if (pass.length > 10) strength += 25
    if (/[A-Z]/.test(pass)) strength += 25
    if (/[0-9!@#$%^&*]/.test(pass)) strength += 25
    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(calculateStrength(newPassword))
  }

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Step 1: Set password
      const passwordResponse = await fetch(`${API_URL}/api/wallet/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      })

      if (!passwordResponse.ok) {
        const errorData = await passwordResponse.json()
        throw new Error(errorData.message || 'Failed to set password')
      }

      // Step 2: Get recovery phrase (mnemonic)
      const mnemonicResponse = await fetch(`${API_URL}/api/wallet/mnemonic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      })

      if (!mnemonicResponse.ok) {
        const errorData = await mnemonicResponse.json()
        throw new Error(errorData.message || 'Failed to generate recovery phrase')
      }

      const mnemonicData = await mnemonicResponse.json()
      setRecoveryPhrase(mnemonicData.mnemonic)
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      console.error('Error creating wallet:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(recoveryPhrase)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePhraseConfirmed = () => {
    setStep(3)
  }

  const handlePhraseInputChange = (index: number, value: string) => {
    const newInputs = [...phraseInputs]
    newInputs[index] = value
    setPhraseInputs(newInputs)
  }

  const handleVerifyPhrase = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Verify the recovery phrase by comparing user input with the stored phrase
      const userEnteredPhrase = phraseInputs.join(' ').trim()
      
      // Call the API to confirm the mnemonic
      const confirmResponse = await fetch(`${API_URL}/api/wallet/confirm-mnemonic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mnemonic: userEnteredPhrase,
        }),
      })

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json()
        throw new Error(errorData.message || 'Failed to verify recovery phrase')
      }

      // If successful, navigate to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || 'Recovery phrase verification failed')
      console.error('Error verifying phrase:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 text-dark-brown hover:text-mauve hover:bg-cream"
          onClick={() => (step > 1 ? setStep(step - 1) : router.push("/"))}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {step === 1 && (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-6">Create New Wallet</h2>
                <div className="space-y-6">
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
                        disabled={isLoading}
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
                        onChange={handlePasswordChange}
                        placeholder="Create a strong password"
                        className="pl-10 bg-cream border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        disabled={isLoading}
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 text-mauve hover:text-dark-brown"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Progress value={passwordStrength} className="h-2" />
                      <p className="text-xs text-mauve">
                        {passwordStrength === 0 && "Enter a password"}
                        {passwordStrength === 25 && "Weak"}
                        {passwordStrength === 50 && "Medium"}
                        {passwordStrength === 75 && "Strong"}
                        {passwordStrength === 100 && "Very strong"}
                      </p>
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
                        disabled={isLoading}
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12"
                    onClick={handleCreateWallet}
                    disabled={!walletName || !password || password !== confirmPassword || passwordStrength < 50 || isLoading}
                  >
                    {isLoading ? "Creating Wallet..." : "Create Wallet"}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-2">Recovery Phrase</h2>
                <p className="text-mauve mb-6">
                  Write down these 12 words in order and keep them in a safe place. This is the only way to recover your
                  wallet if you forget your password.
                </p>
                <div className="bg-cream p-6 rounded-xl mb-6">
                  <div className="grid grid-cols-3 gap-3">
                    {recoveryPhrase.split(" ").map((word, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-mauve mr-1">{index + 1}.</span>
                        <span className="font-medium text-dark-brown">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mb-4 border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
                  onClick={handleCopyPhrase}
                  disabled={isLoading}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
                <Button
                  className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12"
                  onClick={handlePhraseConfirmed}
                  disabled={isLoading}
                >
                  I've Saved My Recovery Phrase
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-3xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-dark-brown mb-2">Verify Recovery Phrase</h2>
                <p className="text-mauve mb-6">Please enter your recovery phrase to confirm you've saved it</p>
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
                        disabled={isLoading}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full bg-mauve hover:bg-brown text-cream rounded-xl h-12"
                  onClick={handleVerifyPhrase}
                  disabled={phraseInputs.some(word => !word) || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-4">Wallet Creation Steps</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step === 1 ? "bg-cream text-mauve" : "bg-cream/20 text-cream"}`}
                  >
                    1
                  </div>
                  <div>
                    <div className="font-medium">Create Credentials</div>
                    <div className="text-sm text-cream/80">Set your wallet name and password</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step === 2 ? "bg-cream text-mauve" : "bg-cream/20 text-cream"}`}
                  >
                    2
                  </div>
                  <div>
                    <div className="font-medium">Save Recovery Phrase</div>
                    <div className="text-sm text-cream/80">Write down your 12-word recovery phrase</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step === 3 ? "bg-cream text-mauve" : "bg-cream/20 text-cream"}`}
                  >
                    3
                  </div>
                  <div>
                    <div className="font-medium">Verify Recovery Phrase</div>
                    <div className="text-sm text-cream/80">Confirm you've saved your recovery phrase</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <Shield className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Security Tips</h3>
              <ul className="space-y-2 text-sm text-cream/80">
                <li>• Never share your recovery phrase with anyone</li>
                <li>• Store your recovery phrase offline</li>
                <li>• Use a strong, unique password</li>
                <li>• Enable two-factor authentication</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}