"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Upload, CheckCircle, AlertCircle, X, CreditCard } from "lucide-react"
import Link from "next/link"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { validateFile, sanitizeInput, validateAccountNumber, logSecurityEvent } from "@/lib/security"
import { getBrowserTradeOrderUseCases } from "@/src/modules/trading/composition/browser"

const cryptoAssets = [
  { symbol: "BTC", name: "Bitcoin", price: 67234, icon: "₿", category: "crypto", network: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum", price: 3456, icon: "Ξ", category: "crypto", network: "Ethereum" },
  { symbol: "TON", name: "Toncoin", price: 5.42, icon: "💎", category: "crypto", network: "TON" },
  { symbol: "SOL", name: "Solana", price: 178, icon: "◎", category: "crypto", network: "Solana" },
  { symbol: "BNB", name: "Binance Coin", price: 245, icon: "BNB", category: "crypto", network: "BSC" },
  { symbol: "SUI", name: "Sui", price: 3.21, icon: "🌊", category: "crypto", network: "Sui" },
  { symbol: "PI", name: "Pi Network", price: 0.45, icon: "π", category: "crypto", network: "Pi Network" },
  { symbol: "USDC", name: "USD Coin", price: 1, icon: "💵", category: "stablecoin" },
  { symbol: "USDT", name: "Tether", price: 1, icon: "₮", category: "stablecoin" },
  { symbol: "PAYPAL", name: "PayPal", price: 1, icon: "💳", category: "fiat" },
  { symbol: "SKRILL", name: "Skrill", price: 1, icon: "💳", category: "fiat" },
  { symbol: "NETELLER", name: "Neteller", price: 1, icon: "💳", category: "fiat" },
]

const networkOptions = {
  USDC: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base"],
  USDT: ["Ethereum", "Tron", "BSC", "Polygon", "Arbitrum"],
}

const nigerianBanks = [
  "First Bank Nigeria",
  "Guaranty Trust Bank",
  "Access Bank",
  "Zenith Bank",
  "United Bank for Africa",
  "Fidelity Bank",
  "Sterling Bank",
  "Union Bank",
  "Wema Bank",
  "Polaris Bank",
  "Stanbic IBTC Bank",
  "Ecobank Nigeria",
  "FCMB",
  "Heritage Bank",
  "Keystone Bank",
]

export default function SellPage() {
  const [selectedAsset, setSelectedAsset] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [usdAmount, setUsdAmount] = useState("")
  const [assetAmount, setAssetAmount] = useState("")
  const [showPayout, setShowPayout] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [payoutDetails, setPayoutDetails] = useState({
    firstName: "",
    lastName: "",
    bankName: "",
    accountNumber: "",
  })
  const [validationErrors, setValidationErrors] = useState({
    firstName: "",
    lastName: "",
    bankName: "",
    accountNumber: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [payoutSubmitted, setPayoutSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState("")
  const [submittedOrderId, setSubmittedOrderId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payoutTimerExpired, setPayoutTimerExpired] = useState(false)

  const selectedCrypto = cryptoAssets.find((asset) => asset.symbol === selectedAsset)
  const ngnEquivalent = usdAmount ? (Number.parseFloat(usdAmount) * 1650).toLocaleString() : "0"

  const requiresNetwork = selectedCrypto?.category === "stablecoin"

  const handleUsdAmountChange = (value: string) => {
    setUsdAmount(value)
    if (selectedCrypto && value) {
      const assetQty = Number.parseFloat(value) / selectedCrypto.price
      setAssetAmount(assetQty.toFixed(8))
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError("")

    try {
      const validationResult = await validateFile(file)

      if (!validationResult.isValid) {
        setUploadError(validationResult.error || "File validation failed")
        logSecurityEvent("FILE_VALIDATION_FAILED", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          error: validationResult.error,
        })
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setUploadedFile(file)

      logSecurityEvent("FILE_UPLOAD_SUCCESS", {
        fileName: validationResult.fileInfo?.name,
        fileType: validationResult.fileInfo?.type,
        fileSize: validationResult.fileInfo?.size,
      })
    } catch (error) {
      setUploadError("Failed to upload file. Please try again.")
      logSecurityEvent("FILE_UPLOAD_ERROR", { error: String(error) })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validatePayoutDetails = () => {
    const errors = {
      firstName: "",
      lastName: "",
      bankName: "",
      accountNumber: "",
    }

    const sanitizedFirstName = sanitizeInput(payoutDetails.firstName)
    const sanitizedLastName = sanitizeInput(payoutDetails.lastName)

    if (!sanitizedFirstName || sanitizedFirstName.length < 2) {
      errors.firstName = "First name is required (minimum 2 characters)"
    }

    if (!sanitizedLastName || sanitizedLastName.length < 2) {
      errors.lastName = "Last name is required (minimum 2 characters)"
    }

    if (!payoutDetails.bankName) {
      errors.bankName = "Please select a bank"
    }

    if (!validateAccountNumber(payoutDetails.accountNumber)) {
      errors.accountNumber = "Account number must be exactly 10 digits"
    }

    setValidationErrors(errors)
    return !Object.values(errors).some((error) => error !== "")
  }

  const handlePayoutSubmit = async () => {
    if (!validatePayoutDetails()) {
      logSecurityEvent("PAYOUT_VALIDATION_FAILED", {
        asset: selectedAsset,
        amount: usdAmount,
      })
      return
    }

    setIsSubmitting(true)
    setSubmissionError("")
    try {
      if (!selectedCrypto || !uploadedFile) {
        throw new Error("Select an asset and upload transaction proof before submitting.")
      }
      const order = await getBrowserTradeOrderUseCases().submitOrder({
        side: "sell",
        assetSymbol: selectedCrypto.symbol,
        network: selectedNetwork || null,
        amountUsd: Number.parseFloat(usdAmount),
        assetQuantity: Number.parseFloat(assetAmount),
        feeUsd: 0,
        destination: `${payoutDetails.firstName} ${payoutDetails.lastName} | ${payoutDetails.bankName} | ${payoutDetails.accountNumber}`,
      })
      setSubmittedOrderId(order.id)
      setPayoutSubmitted(true)
      setShowPayout(false)

      logSecurityEvent("TRADE_ORDER_SUBMITTED", {
        orderId: order.id,
        side: order.side,
        asset: order.assetSymbol,
        network: order.network,
        amount: order.amountUsd,
      })
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Could not submit your order. Please try again.")
      logSecurityEvent("TRADE_ORDER_SUBMISSION_ERROR", { error: String(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayoutTimerExpire = () => {
    setPayoutTimerExpired(true)
    setShowPayout(false) // Auto-close modal when timer expires
    logSecurityEvent("PAYOUT_MODAL_TIMER_EXPIRED", {
      asset: selectedAsset,
      amount: usdAmount,
    })
  }

  const isAmountValid = usdAmount && Number.parseFloat(usdAmount) >= 4

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Sell Assets</h1>
        </div>

        {payoutSubmitted && (
          <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            Order request saved for review. Reference: <span className="font-mono">{submittedOrderId.slice(0, 8)}</span>.
            This does not transfer assets or send a payout.
          </div>
        )}

        {submissionError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {submissionError}
          </div>
        )}

        {/* Sell Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sell Assets</CardTitle>
            <CardDescription>Convert your assets to NGN</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset">Select Asset to Sell</Label>
              <Select
                value={selectedAsset}
                onValueChange={(value) => {
                  setSelectedAsset(value)
                  setSelectedNetwork("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose asset to sell" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Cryptocurrencies</div>
                  {cryptoAssets
                    .filter((asset) => asset.category === "crypto")
                    .map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{asset.icon}</span>
                          <span>
                            {asset.name} ({asset.symbol})
                          </span>
                          <span className="text-muted-foreground">${asset.price.toLocaleString()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Stablecoins</div>
                  {cryptoAssets
                    .filter((asset) => asset.category === "stablecoin")
                    .map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{asset.icon}</span>
                          <span>
                            {asset.name} ({asset.symbol})
                          </span>
                          <span className="text-muted-foreground">${asset.price.toLocaleString()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Fiat Rails</div>
                  {cryptoAssets
                    .filter((asset) => asset.category === "fiat")
                    .map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono">{asset.icon}</span>
                          <span>{asset.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Network Selection for USDC/USDT */}
            {requiresNetwork && (
              <div className="space-y-2">
                <Label htmlFor="network">Select Sending Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose sending network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networkOptions[selectedAsset as keyof typeof networkOptions]?.map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usd-amount">Amount to Sell (USD)</Label>
                <Input
                  id="usd-amount"
                  type="number"
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => handleUsdAmountChange(e.target.value)}
                />
                {usdAmount && Number.parseFloat(usdAmount) < 4 && (
                  <p className="text-xs text-red-600">Minimum sell amount is $4.00</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-amount">Asset Amount</Label>
                <Input id="asset-amount" placeholder="0.00000000" value={assetAmount} readOnly className="bg-muted" />
              </div>
            </div>

            {/* Value Display */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">NGN Equivalent:</span>
                <span className="text-lg font-semibold">₦{ngnEquivalent}</span>
              </div>
            </div>

            {/* Admin Wallet Address */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Send {selectedAsset || "Asset"} to:
                {requiresNetwork && selectedNetwork && ` (${selectedNetwork})`}
              </h4>
              <p className="text-sm text-blue-800 font-mono break-all">
                {selectedCrypto?.category === "crypto"
                  ? "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                  : "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e"}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Network: {requiresNetwork && selectedNetwork ? selectedNetwork : selectedCrypto?.network || "N/A"}
              </p>
            </div>

            {/* Enhanced Upload Proof (Optional) */}
            <div className="space-y-2">
              <Label>Upload Transaction Proof (Optional)</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : uploadedFile
                      ? "border-green-300 bg-green-50"
                      : "border-muted-foreground/25"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm font-medium text-green-800">{uploadedFile.name}</span>
                      <Button
                        variant="ghost"
                        onClick={removeFile}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-600">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : isUploading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG • Max 10MB</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2">
                      Choose File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              {uploadError && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Enhanced Sell Button */}
            <Dialog open={showPayout} onOpenChange={setShowPayout}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={
                    !selectedAsset ||
                    !usdAmount ||
                    !isAmountValid ||
                    (requiresNetwork && !selectedNetwork) ||
                    payoutTimerExpired
                  }
                >
                  Done - Proceed to Payout
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Provide Payout Details</span>
                  </DialogTitle>
                  <DialogDescription>Enter your Nigerian bank details for NGN transfer</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                  <div className="space-y-4 pb-4">
                    {/* Enhanced Payout Form */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="first-name" className="text-sm font-medium">
                            First Name *
                          </Label>
                          <Input
                            id="first-name"
                            placeholder="First name"
                            value={payoutDetails.firstName}
                            onChange={(e) => {
                              const sanitized = sanitizeInput(e.target.value)
                              setPayoutDetails({ ...payoutDetails, firstName: sanitized })
                              if (validationErrors.firstName) {
                                setValidationErrors({ ...validationErrors, firstName: "" })
                              }
                            }}
                            maxLength={50}
                            className={`text-sm ${validationErrors.firstName ? "border-red-500" : ""}`}
                          />
                          {validationErrors.firstName && (
                            <p className="text-xs text-red-600">{validationErrors.firstName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="last-name" className="text-sm font-medium">
                            Last Name *
                          </Label>
                          <Input
                            id="last-name"
                            placeholder="Last name"
                            value={payoutDetails.lastName}
                            onChange={(e) => {
                              const sanitized = sanitizeInput(e.target.value)
                              setPayoutDetails({ ...payoutDetails, lastName: sanitized })
                              if (validationErrors.lastName) {
                                setValidationErrors({ ...validationErrors, lastName: "" })
                              }
                            }}
                            maxLength={50}
                            className={`text-sm ${validationErrors.lastName ? "border-red-500" : ""}`}
                          />
                          {validationErrors.lastName && (
                            <p className="text-xs text-red-600">{validationErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-name" className="text-sm font-medium">
                          Bank Name *
                        </Label>
                        <Select
                          value={payoutDetails.bankName}
                          onValueChange={(value) => {
                            setPayoutDetails({ ...payoutDetails, bankName: value })
                            if (validationErrors.bankName) {
                              setValidationErrors({ ...validationErrors, bankName: "" })
                            }
                          }}
                        >
                          <SelectTrigger className={`text-sm ${validationErrors.bankName ? "border-red-500" : ""}`}>
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {nigerianBanks.map((bank) => (
                              <SelectItem key={bank} value={bank} className="text-sm">
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.bankName && (
                          <p className="text-xs text-red-600">{validationErrors.bankName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="account-number" className="text-sm font-medium">
                          Account Number *
                        </Label>
                        <Input
                          id="account-number"
                          placeholder="10-digit account number"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          value={payoutDetails.accountNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            setPayoutDetails({ ...payoutDetails, accountNumber: value })
                            if (validationErrors.accountNumber) {
                              setValidationErrors({ ...validationErrors, accountNumber: "" })
                            }
                          }}
                          className={`text-sm ${validationErrors.accountNumber ? "border-red-500" : ""}`}
                        />
                        {validationErrors.accountNumber && (
                          <p className="text-xs text-red-600">{validationErrors.accountNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg space-y-2 bg-muted/50">
                      <h4 className="font-medium text-sm">Transaction Summary</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Selling:</span>
                          <span className="font-medium">
                            {selectedCrypto?.category === "fiat" ? `$${usdAmount}` : `${assetAmount} ${selectedAsset}`}
                          </span>
                        </div>
                        {requiresNetwork && selectedNetwork && (
                          <div className="flex justify-between text-xs">
                            <span>Network:</span>
                            <span className="font-medium">{selectedNetwork}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span>USD Value:</span>
                          <span className="font-medium">${usdAmount}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-semibold text-sm">
                          <span>You'll receive:</span>
                          <span className="text-green-600">₦{ngnEquivalent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <CountdownTimer
                        initialMinutes={15}
                        onExpire={handlePayoutTimerExpire}
                        variant="warning"
                        title="Rate valid for"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={handlePayoutSubmit}
                    disabled={isSubmitting || payoutTimerExpired}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Confirm Payout Details"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
