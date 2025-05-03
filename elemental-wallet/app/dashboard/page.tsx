"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowDownUp, Clock, Copy, CreditCard, QrCode, Send, Settings, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WalletHeader } from "@/components/wallet-header"
import { TransactionList } from "@/components/transaction-list"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { useAccounts } from "@/contexts/account-context"

// API service
const API_URL = "http://localhost:3000/api";

const fetchAccounts = async () => {
  try {
    const response = await fetch(`${API_URL}/wallet/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return await response.json();
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return { success: false, accounts: [] }; // fallback
  }
};

const fetchBalances = async () => {
  try {
    const response = await fetch(`${API_URL}/blockchain/balances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // send empty body to avoid backend crash
    });
    if (!response.ok) throw new Error('Failed to fetch balances');
    return await response.json();
  } catch (error) {
    console.error("Error fetching balances:", error);
    return { success: false, data: {} };
  }
};

const fetchCustomTokens = async () => {
  try {
    const response = await fetch(`${API_URL}/blockchain/tokens`);
    if (!response.ok) throw new Error('Failed to fetch custom tokens');
    return await response.json();
  } catch (error) {
    console.error("Error fetching custom tokens:", error);
    return { success: false, data: { tokens: {} } };
  }
};

const fetchTransactionHistory = async () => {
  try {
    const response = await fetch(`${API_URL}/blockchain/history`);
    if (!response.ok) throw new Error('Failed to fetch transaction history');
    return await response.json();
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return { success: false, data: { transactions: [] } };
  }
};

const addCustomToken = async (tokenAddress: network = "ethereum") => {
  try {
    const response = await fetch(`${API_URL}/blockchain/token/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tokenAddress, network })
    });
    if (!response.ok) throw new Error('Failed to add custom token');
    return await response.json();
  } catch (error) {
    console.error("Error adding custom token:", error);
    throw error;
  }
};

const switchAccount = async (address) => {
  try {
    const response = await fetch(`${API_URL}/wallet/switch-account`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });
    if (!response.ok) throw new Error('Failed to switch account');
    return await response.json();
  } catch (error) {
    console.error("Error switching account:", error);
    throw error;
  }
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const { activeAccount, setActiveAccount, accounts, setAccounts } = useAccounts()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tokenAddress, setTokenAddress] = useState('')
  const [network, setNetwork] = useState('ethereum')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customTokens, setCustomTokens] = useState([])
  const [balancesData, setBalancesData] = useState({})
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')
  const [transactions, setTransactions] = useState([])
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' })

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
  
        const [accountsData, balancesResponse, tokensData, historyData] = await Promise.allSettled([
          fetchAccounts(),
          fetchBalances(),
          fetchCustomTokens(),
          fetchTransactionHistory()
        ]);
  
        // Accounts
        if (accountsData.status === 'fulfilled') {
          const data = accountsData.value;
          if (data.success && data.accounts && data.accounts.length > 0 && typeof setAccounts === 'function') {
            setAccounts(data.accounts);
            if (!activeAccount && data.currentAccount) {
              setActiveAccount(data.currentAccount);
            }
          }
        } else {
          console.error("Accounts fetch failed:", accountsData.reason);
          setNotification({ show: true, message: 'Failed to load accounts.', type: 'error' });
        }
  
        // Balances
        if (balancesResponse.status === 'fulfilled') {
          const res = balancesResponse.value;
          if (res.success && res.data) {
            setBalancesData(res.data);
            const networks = Object.keys(res.data);
            const networkWithBalance = networks.find(net =>
              res.data[net].nativeBalance &&
              parseFloat(res.data[net].nativeBalance.balance) > 0
            ) || networks[0];
            setSelectedNetwork(networkWithBalance);
          }
        } else {
          console.error("Balances fetch failed:", balancesResponse.reason);
          setNotification({ show: true, message: 'Failed to load balances.', type: 'error' });
        }
  
        // Tokens
        if (tokensData.status === 'fulfilled') {
          const res = tokensData.value;
          if (res.success && res.data && res.data.tokens) {
            const allTokens = [];
            Object.entries(res.data.tokens).forEach(([networkId, networkTokens]) => {
              networkTokens.forEach(token => {
                allTokens.push({ ...token, network: networkId });
              });
            });
            setCustomTokens(allTokens);
          }
        } else {
          console.error("Custom tokens fetch failed:", tokensData.reason);
          setNotification({ show: true, message: 'Failed to load custom tokens.', type: 'error' });
        }
  
        // History
        if (historyData.status === 'fulfilled') {
          const res = historyData.value;
          if (res.success && res.data && res.data.transactions) {
            const formatted = res.data.transactions.map(tx => ({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              amount: tx.value,
              token: 'ETH',
              timestamp: tx.timestamp * 1000,
              type: tx.from.toLowerCase() === (activeAccount?.address || '').toLowerCase() ? 'SEND' : 'RECEIVE',
              status: tx.status
            }));
            setTransactions(formatted);
          }
        } else {
          console.error("Transaction history fetch failed:", historyData.reason);
          setNotification({ show: true, message: 'Failed to load transactions.', type: 'error' });
        }
      } catch (error) {
        console.error("Dashboard unexpected error:", error);
        setNotification({
          show: true,
          message: 'Unexpected error. Please refresh the page.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    initializeDashboard();
  }, [setAccounts, setActiveAccount, activeAccount]);






  const handleAddToken = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTokenAddress('');
    setError('');
  };

  const validateTokenAddress = (address) => {
    // Basic validation - check if it's at least somewhat like an Ethereum address
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmitToken = async () => {
    if (!validateTokenAddress(tokenAddress)) {
      setError('Please enter a valid token address (0x followed by 40 hex characters)');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Call API to add custom token
      const result = await addCustomToken(tokenAddress, network);
      
      if (result.success && result.data && result.data.token) {
        // Update UI with new token
        setCustomTokens(prev => [...prev, result.data.token]);
        
        setNotification({
          show: true,
          message: 'Token added successfully!',
          type: 'success'
        });
        
        closeModal();
      } else {
        throw new Error(result.message || 'Failed to add token');
      }
    } catch (error) {
      setError(error.message || 'Failed to add token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNetworkChange = (network) => {
    setSelectedNetwork(network);
  };

  // Calculate total balance across all networks
  const calculateTotalBalance = () => {
    if (!balancesData || Object.keys(balancesData).length === 0) return "0.00";

    // Mock conversion rates in USD
    const rates = {
      ETH: 1800,
      LINK: 20,
      MATIC: 0.5,
      BNB: 300,
      AVAX: 15,
      SEP: 1800, // Treating Sepolia ETH same as mainnet for demo
    };

    // Calculate from all networks
    let total = 0;
    
    Object.values(balancesData).forEach(networkData => {
      // Add native token balance
      if (networkData.nativeBalance) {
        const symbol = networkData.nativeBalance.symbol;
        const balance = parseFloat(networkData.nativeBalance.balance);
        const rate = rates[symbol] || 1;
        console.log(balance);
        total += balance * rate;
      }
      
      // Add token balances
      if (networkData.tokens && networkData.tokens.length > 0) {
        networkData.tokens.forEach(token => {
          const symbol = token.symbol;
          const balance = parseFloat(token.balance);
          const rate = rates[symbol] || 1;
          total += balance * rate;
        });
      }
    });

    return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSwitchAccount = async (address) => {
    try {
      setIsLoading(true);
      const result = await switchAccount(address);
      
      if (result.success) {
        // Update accounts and active account
        const updatedAccounts = await fetchAccounts();
        if (updatedAccounts.success && updatedAccounts.accounts) {
          accounts(updatedAccounts.accounts);
          
          if (updatedAccounts.currentAccount) {
            setActiveAccount(updatedAccounts.currentAccount);
          }
        }
        
        // Refetch balances
        const newBalances = await fetchBalances();
        if (newBalances.success && newBalances.data) {
          setBalancesData(newBalances.data);
        }
        
        setNotification({
          show: true,
          message: 'Account switched successfully',
          type: 'success'
        });
      } else {
        throw new Error(result.message || 'Failed to switch account');
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to switch account',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification({
      show: true,
      message: 'Address copied to clipboard!',
      type: 'success'
    });
    
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const getTokenValueInUsd = (symbol, balance) => {
    const rates = {
      ETH: 1800,
      LINK: 20,
      MATIC: 0.5,
      BNB: 300,
      AVAX: 15,
      SEP: 1800, // Treating Sepolia ETH same as mainnet for demo
    };
    
    const rate = rates[symbol] || 1;
    return (parseFloat(balance) * rate).toFixed(2);
  };

  // Get assets to display based on selected network
  const getAssets = () => {
    if (!balancesData || !balancesData[selectedNetwork]) {
      return [];
    }

    const networkData = balancesData[selectedNetwork];
    const assets = [];

    // Add native token if balance exists
    if (networkData.nativeBalance) {
      assets.push({
        type: 'native',
        name: networkData.network.split(' ')[0], // Extract network name
        symbol: networkData.nativeBalance.symbol,
        balance: networkData.nativeBalance.balance,
        valueUsd: getTokenValueInUsd(networkData.nativeBalance.symbol, networkData.nativeBalance.balance)
      });
    }

    // Add tokens
    if (networkData.tokens && networkData.tokens.length > 0) {
      networkData.tokens.forEach(token => {
        assets.push({
          type: 'token',
          address: token.tokenAddress,
          name: token.name,
          symbol: token.symbol,
          balance: token.balance,
          valueUsd: getTokenValueInUsd(token.symbol, token.balance)
        });
      });
    }

    return assets;
  };

  // Get available networks from balances data
  const getNetworks = () => {
    if (!balancesData) return [];
    return Object.keys(balancesData).map(key => ({
      id: key,
      name: balancesData[key].network
    }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <WalletHeader />

      {notification.show && (
        <div className="container mx-auto px-4 py-2">
          <Alert className={`${notification.type === 'error' ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'}`}>
            <AlertCircle className={`h-4 w-4 ${notification.type === 'error' ? 'text-red-500' : 'text-green-500'}`} />
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 md:py-8">
        {isLoading && (
          <div className="flex justify-center mb-4">
            <div className="h-6 w-6 border-2 border-mauve border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main balance card */}
          <div className="md:col-span-12 bg-mauve rounded-3xl p-6 shadow-md text-cream">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">Total Balance</h2>
                <div className="text-4xl font-bold">${calculateTotalBalance()}</div>
                <div className="text-sm text-cream/80 mt-1">
                  Account: {activeAccount?.name || 'Loading...'}
                </div>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button asChild className="bg-cream text-mauve hover:bg-cream/90 rounded-xl">
                  <Link href="/send">
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Link>
                </Button>
                <Button asChild className="bg-cream text-mauve hover:bg-cream/90 rounded-xl">
                  <Link href="/receive">
                    <QrCode className="mr-2 h-4 w-4" />
                    Receive
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Bento grid layout */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Assets card */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <div className="flex flex-col mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-dark-brown">Assets</h3>
                  <Button variant="ghost" size="sm" className="text-mauve">
                    View All
                  </Button>
                </div>
                
                {/* Network    */}
                <div className="mt-2 overflow-x-auto">
                  <div className="flex space-x-2 pb-2">
                    {getNetworks().map(network => (
                      <Button
                        key={network.id}
                        variant={selectedNetwork === network.id ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${
                          selectedNetwork === network.id 
                            ? "bg-mauve text-cream" 
                            : "bg-cream/50 text-mauve border-mauve/20"
                        }`}
                        onClick={() => handleNetworkChange(network.id)}
                      >
                        {network.name}
                        {/* {network.name.split(' ')[0]} */}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Assets list */}
                {getAssets().map((asset, index) => (
                  <div
                    key={asset.symbol + index}
                    className="flex items-center justify-between p-2 hover:bg-cream/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-mauve/20 flex items-center justify-center mr-3">
                        <CreditCard className="h-5 w-5 text-mauve" />
                      </div>
                      <div>
                        <div className="font-medium text-dark-brown">{asset.name}</div>
                        <div className="text-sm text-mauve">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-dark-brown">
                        {asset.balance} {asset.symbol}
                      </div>
                      <div className="text-sm text-mauve">
                        ${asset.valueUsd}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Display custom tokens for the selected network */}
                {customTokens
                  .filter(token => token.networkId === selectedNetwork)
                  .map((token) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between p-2 hover:bg-cream/50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-mauve/20 flex items-center justify-center mr-3">
                          <CreditCard className="h-5 w-5 text-mauve" />
                        </div>
                        <div>
                          <div className="font-medium text-dark-brown">{token.name}</div>
                          <div className="text-sm text-mauve">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-dark-brown">
                          {token.balance || '0'} {token.symbol}
                        </div>
                        <div className="text-sm text-mauve">
                          ${token.valueUsd || '0.00'}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {/* Show loading state or empty state */}
                {isLoading && getAssets().length === 0 && customTokens.filter(t => t.networkId === selectedNetwork).length === 0 && (
                  <div className="text-center py-4 text-mauve">Loading assets...</div>
                )}
                
                {!isLoading && getAssets().length === 0 && customTokens.filter(t => t.networkId === selectedNetwork).length === 0 && (
                  <div className="text-center py-4 text-mauve">No assets found on {balancesData[selectedNetwork]?.network || selectedNetwork}</div>
                )}
              </div>
            </div>

            {/* QR Code card */}
            <div className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-dark-brown mb-4">Receive Crypto</h3>
            <QRCodeDisplay 
    // Ensure this matches exactly with the address used on the Receive page
    // If the Receive page uses a different source, use that same source here
            address={activeAccount?.address || "Loading address..."} 
            size={150} 
            />
  <div className="mt-4 text-center">
    <div className="text-xs text-mauve mb-1">Your Wallet Address</div>
    <div className="text-sm font-medium text-dark-brown flex items-center">
      {activeAccount
        ? `${activeAccount.address.substring(0, 12)}...${activeAccount.address.substring(activeAccount.address.length - 4)}`
        : "Loading address..."}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 ml-1"
        onClick={() => activeAccount && copyToClipboard(activeAccount.address)}
      >
        <Copy className="h-3 w-3" />
        <span className="sr-only">Copy address</span>
      </Button>
    </div>
  </div>
</div>

            {/* Recent Transactions card */}
            <div className="sm:col-span-2 bg-white rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-dark-brown">Recent Transactions</h3>
                <Button asChild variant="ghost" size="sm" className="text-mauve">
                  <Link href="/activity">View All</Link>
                </Button>
              </div>
              
              {/* Show API-fetched transactions if available */}
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={tx.hash || index} className="flex items-center justify-between p-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full ${tx.type === 'SEND' ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center mr-3`}>
                          {tx.type === 'SEND' ? (
                            <Send className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowDownUp className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-dark-brown">{tx.type}</div>
                          <div className="text-xs text-mauve">{new Date(tx.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${tx.type === 'SEND' ? 'text-red-500' : 'text-green-500'}`}>
                          {tx.type === 'SEND' ? '-' : '+'}{tx.amount} {tx.token || 'ETH'}
                        </div>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-mauve hover:underline"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <TransactionList /> // Fallback to your existing TransactionList component
              )}
            </div>
          </div>

          {/* Quick actions sidebar */}
          <div className="md:col-span-4 grid grid-cols-1 gap-6">
            <div className="bg-brown rounded-3xl p-6 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button asChild className="w-full bg-cream text-brown hover:bg-cream/90 rounded-xl justify-start">
                  <Link href="/send">
                    <Send className="mr-2 h-5 w-5" />
                    Send Crypto
                  </Link>
                </Button>
                <Button asChild className="w-full bg-cream text-brown hover:bg-cream/90 rounded-xl justify-start">
                  <Link href="/receive">
                    <QrCode className="mr-2 h-5 w-5" />
                    Receive Crypto
                  </Link>
                </Button>
                <Button asChild className="w-full bg-cream text-brown hover:bg-cream/90 rounded-xl justify-start">
                  <Link href="/swap">
                    <ArrowDownUp className="mr-2 h-5 w-5" />
                    Swap Tokens
                  </Link>
                </Button>
                <Button asChild className="w-full bg-cream text-brown hover:bg-cream/90 rounded-xl justify-start">
                  <Link href="/activity">
                    <Clock className="mr-2 h-5 w-5" />
                    Transaction History
                  </Link>
                </Button>
                <Button asChild className="w-full bg-cream text-brown hover:bg-cream/90 rounded-xl justify-start">
                  <Link href="/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Link>
                </Button>
              </div>
            </div>

            {/* Accounts section */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-dark-brown">My Accounts</h3>
              <div className="space-y-2">
                {accounts && accounts.map((account) => (
                  <div 
                    key={account.address} 
                    className={`p-3 rounded-xl cursor-pointer flex items-center justify-between ${
                      activeAccount?.address === account.address ? 'bg-mauve/10 border border-mauve/30' : 'hover:bg-cream'
                    }`}
                    onClick={() => handleSwitchAccount(account.address)}
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-mauve/20 flex items-center justify-center mr-3">
                        <CreditCard className="h-4 w-4 text-mauve" />
                      </div>
                      <div>
                        <div className="font-medium text-dark-brown">{account.name}</div>
                        <div className="text-xs text-mauve">
                          {account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)}
                        </div>
                      </div>
                    </div>
                    {activeAccount?.address === account.address && (
                      <div className="h-3 w-3 rounded-full bg-mauve"></div>
                    )}
                  </div>
                ))}
                
                <Button asChild className="w-full mt-2 bg-mauve/10 text-mauve hover:bg-mauve/20 rounded-xl">
                  <Link href="/settings?tab=accounts">
                    Add Account
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-dark-brown rounded-3xl p-6 shadow-md text-cream">
              <h3 className="text-xl font-bold mb-4">Add Custom Tokens</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                </div>
                <Button onClick={handleAddToken} className="w-full mt-2 bg-cream text-dark-brown hover:bg-cream/90 rounded-xl">
                  Add Token
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for adding custom token */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-dark-brown">Add Custom Token</h3>
              <Button variant="ghost" size="icon" onClick={closeModal} className="text-mauve hover:text-dark-brown hover:bg-cream/50 rounded-full h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-brown">Token Address</label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-3 bg-cream rounded-xl text-dark-brown border border-mauve/20 focus:outline-none focus:ring-2 focus:ring-mauve"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-dark-brown">Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full p-3 bg-cream rounded-xl text-dark-brown border border-mauve/20 focus:outline-none focus:ring-2 focus:ring-mauve"
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="sepolia">Sepolia</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="polygon">Polygon</option>
                  <option value="bsc">BSC</option>
                  <option value="avalanche">Avalanche</option>
                </select>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1 py-2 bg-cream text-dark-brown border border-mauve/20 hover:bg-cream/80 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitToken}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-mauve text-cream hover:bg-mauve/90 rounded-xl flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-cream border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Add"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}