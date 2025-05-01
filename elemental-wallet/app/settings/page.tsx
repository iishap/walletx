"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Key, Moon, Shield, Sun, User, Lock, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { WalletHeader } from "@/components/wallet-header"

export default function SettingsPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [autoLogout, setAutoLogout] = useState(true)

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <WalletHeader />

      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8">
        <Button
          variant="ghost"
          className="mb-4 text-dark-brown hover:text-mauve hover:bg-cream"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-md">
              <h2 className="text-3xl font-bold text-dark-brown mb-6">Settings</h2>

              <Tabs defaultValue="security">
                <TabsList className="bg-cream">
                  <TabsTrigger value="security" className="data-[state=active]:bg-mauve data-[state=active]:text-cream">
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="data-[state=active]:bg-mauve data-[state=active]:text-cream"
                  >
                    Preferences
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="data-[state=active]:bg-mauve data-[state=active]:text-cream">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="security" className="space-y-6 pt-6">
                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Password</h3>

                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-dark-brown">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="pl-10 bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
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
                      <Label htmlFor="new-password" className="text-dark-brown">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="pl-10 bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-dark-brown">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="pl-10 bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-mauve" />
                      </div>
                    </div>

                    <Button className="w-full bg-mauve hover:bg-brown text-cream rounded-xl">Update Password</Button>
                  </div>

                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Two-Factor Authentication</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-dark-brown">Enable 2FA</div>
                        <div className="text-sm text-mauve">Add an extra layer of security to your wallet</div>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                        className="data-[state=checked]:bg-mauve"
                      />
                    </div>

                    {twoFactorEnabled && (
                      <Button
                        variant="outline"
                        className="w-full border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
                      >
                        Set Up Two-Factor Authentication
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Recovery</h3>

                    <Button
                      variant="outline"
                      className="w-full border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      View Recovery Phrase
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Export Private Key
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6 pt-6">
                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Appearance</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-dark-brown">Dark Mode</div>
                        <div className="text-sm text-mauve">Switch between light and dark themes</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-mauve" />
                        <Switch
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                          className="data-[state=checked]:bg-mauve"
                        />
                        <Moon className="h-4 w-4 text-mauve" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Currency</h3>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-dark-brown">
                        Display Currency
                      </Label>
                      <Select defaultValue="usd">
                        <SelectTrigger
                          id="currency"
                          className="bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        >
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-mauve/10">
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                          <SelectItem value="jpy">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Network</h3>

                    <div className="space-y-2">
                      <Label htmlFor="network" className="text-dark-brown">
                        Default Network
                      </Label>
                      <Select defaultValue="ethereum">
                        <SelectTrigger
                          id="network"
                          className="bg-white border-mauve/10 focus:border-mauve focus:ring-mauve rounded-xl"
                        >
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                        <SelectContent className="bg-cream border-mauve/10">
                          <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6 pt-6">
                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Session</h3>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium text-dark-brown">Auto Logout</div>
                        <div className="text-sm text-mauve">Automatically log out after 15 minutes of inactivity</div>
                      </div>
                      <Switch
                        checked={autoLogout}
                        onCheckedChange={setAutoLogout}
                        className="data-[state=checked]:bg-mauve"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-cream p-6 rounded-xl">
                    <h3 className="text-xl font-bold text-dark-brown">Data</h3>

                    <Button
                      variant="outline"
                      className="w-full border-mauve text-mauve hover:bg-mauve hover:text-cream rounded-xl"
                    >
                      Clear Cache
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl"
                    >
                      Reset Wallet
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-mauve rounded-3xl p-6 shadow-md text-cream">
              <User className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Account Information</h3>
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <div>Username</div>
                  <div className="font-medium">ElementalUser</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Email</div>
                  <div className="font-medium">user@example.com</div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Member Since</div>
                  <div className="font-medium">Apr 2023</div>
                </div>
              </div>
            </div>

            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <Bell className="h-10 w-10 mb-4" />
              <h3 className="text-xl font-bold mb-2">Notifications</h3>
              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div>Transaction Alerts</div>
                  <Switch className="data-[state=checked]:bg-cream data-[state=checked]:text-brown" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>Price Alerts</div>
                  <Switch className="data-[state=checked]:bg-cream data-[state=checked]:text-brown" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>Security Alerts</div>
                  <Switch className="data-[state=checked]:bg-cream data-[state=checked]:text-brown" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>Newsletter</div>
                  <Switch className="data-[state=checked]:bg-cream data-[state=checked]:text-brown" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
