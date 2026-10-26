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
import { ArrowLeft, Upload, CheckCircle, AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { validateFile, sanitizeInput, logSecurityEvent } from "@/lib/security"
import { getBrowserTradeOrderUseCases } from "@/src/modules/trading/composition/browser"

const cryptoAssets = [
  { symbol: "BTC", name: "Bitcoin", price: 67234, icon: "₿", category: "crypto", transactionFee: 2.0 },
  { symbol: "ETH", name: "Ethereum", price: 3456, icon: "Ξ", category: "crypto", transactionFee: 2.0 },
  { symbol: "TON", name: "Toncoin", price: 5.42, icon: "💎", category: "crypto", transactionFee: 3.0 },
  { symbol: "SOL", name: "Solana", price: 178, icon: "◎", category: "crypto", transactionFee: 2.0 },
  { symbol: "BNB", name: "Binance Coin", price: 245, icon: "BNB", category: "crypto", transactionFee: 2.0 },
  { symbol: "SUI", name: "Sui", price: 3.21, icon: "🌊", category: "crypto", transactionFee: 3.0 },
  { symbol: "PI", name: "Pi Network", price: 0.45, icon: "π", category: "crypto", transactionFee: 4.0 },
  { symbol: "USDC", name: "USD Coin", price: 1, icon: "💵", category: "stablecoin", transactionFee: 1.0 },
  { symbol: "USDT", name: "Tether", price: 1, icon: "₮", category: "stablecoin", transactionFee: 1.0 },
  { symbol: "PAYPAL", name: "PayPal", price: 1, icon: "💳", category: "fiat", transactionFee: 5.0 },
  { symbol: "SKRILL", name: "Skrill", price: 1, icon: "💳", category: "fiat", transactionFee: 4.0 },
  { symbol: "NETELLER", name: "Neteller", price: 1, icon: "💳", category: "fiat", transactionFee: 4.0 },
]

const networkOptions = {
  USDC: ["Ethereum", "Polygon", "Arbitrum", "Optimism", "Base"],
  USDT: ["Ethereum", "Tron", "BSC", "Polygon", "Arbitrum"],
}

export default function BuyPage() {
  const [selectedAsset, setSelectedAsset] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [usdAmount, setUsdAmount] = useState("")
  const [assetAmount, setAssetAmount] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [emailAddress, setEmailAddress] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [submissionError, setSubmissionError] = useState("")
  const [submittedOrderId, setSubmittedOrderId] = useState("")
  const [timerExpired, setTimerExpired] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedCrypto = cryptoAssets.find((asset) => asset.symbol === selectedAsset)
  const transactionFeeAmount = selectedCrypto ? selectedCrypto.transactionFee : 0
  const totalAmountWithFee = usdAmount ? Number.parseFloat(usdAmount) + transactionFeeAmount : 0
  const ngnEquivalent = totalAmountWithFee ? (totalAmountWithFee * 1650).toLocaleString() : "0"

  const requiresNetwork = selectedCrypto?.category === "stablecoin"

  const handleUsdAmountChange = (value: string) => {
    setUsdAmount(value)
    if (selectedCrypto && value) {
      const assetQty = Number.parseFloat(value) / selectedCrypto.price
      setAssetAmount(assetQty.toFixed(8))
    }
  }

  const cryptoGroup = cryptoAssets.filter((asset) => asset.category === "crypto")
  const stablecoinGroup = cryptoAssets.filter((asset) => asset.category === "stablecoin")
  const fiatGroup = cryptoAssets.filter((asset) => asset.category === "fiat")

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

      await new Promise((resolve) => setTimeout(resolve, 2000))
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

  const handleWalletAddressChange = (value: string) => {
    const sanitized = sanitizeInput(value)
    setWalletAddress(sanitized)
  }

  const handleEmailAddressChange = (value: string) => {
    const sanitized = sanitizeInput(value)
    setEmailAddress(sanitized)
  }

  const handleTransactionSubmit = async () => {
    if (!selectedCrypto || !uploadedFile || !isAmountValid) return
    setIsSubmittingOrder(true)
    setSubmissionError("")

    try {
      const order = await getBrowserTradeOrderUseCases().submitOrder({
        side: "buy",
        assetSymbol: selectedCrypto.symbol,
        network: selectedNetwork || null,
        amountUsd: Number.parseFloat(usdAmount),
        assetQuantity: Number.parseFloat(assetAmount),
        feeUsd: transactionFeeAmount,
        destination: selectedCrypto.category === "fiat" ? emailAddress : walletAddress,
      })
      setSubmittedOrderId(order.id)
      setShowConfirmation(false)

      logSecurityEvent("TRADE_ORDER_SUBMITTED", {
        orderId: order.id,
        side: order.side,
        asset: order.assetSymbol,
        network: order.network,
        amount: order.amountUsd,
        hasProof: !!uploadedFile,
      })
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Could not submit your order. Please try again.")
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const handleTimerExpire = () => {
    setTimerExpired(true)
    logSecurityEvent("TRANSACTION_TIMER_EXPIRED", {
      asset: selectedAsset,
      amount: usdAmount,
    })
  }

  const isAmountValid = usdAmount && Number.parseFloat(usdAmount) >= 5

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
          <h1 className="text-2xl font-bold">Buy Assets</h1>
        </div>

        {/* Transaction Expired Notice */}
        {timerExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-medium">Transaction Expired</h3>
                <p className="text-sm">Please start a new transaction to continue.</p>
              </div>
            </div>
          </div>
        )}

        {submissionError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {submissionError}
          </div>
        )}

        {submittedOrderId && (
          <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            Order request saved for review. Reference: <span className="font-mono">{submittedOrderId.slice(0, 8)}</span>.
            This records a request only; it does not transfer funds or execute a blockchain trade.
          </div>
        )}

        {/* Buy Form */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Assets</CardTitle>
            <CardDescription>Buy cryptocurrencies, stablecoins, or fund fiat rails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Asset Selection */}
            <div className="space-y-2">
              <Label htmlFor="asset">Select Asset</Label>
              <Select
                value={selectedAsset}
                onValueChange={(value) => {
                  setSelectedAsset(value)
                  setSelectedNetwork("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose asset to buy" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Cryptocurrencies</div>
                  {cryptoGroup.map((asset) => (
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
                  {stablecoinGroup.map((asset) => (
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
                  {fiatGroup.map((asset) => (
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
                <Label htmlFor="network">Select Network</Label>
                <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose receiving network" />
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
                <Label htmlFor="usd-amount">Amount (USD)</Label>
                <Input
                  id="usd-amount"
                  type="number"
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => handleUsdAmountChange(e.target.value)}
                />
                {usdAmount && Number.parseFloat(usdAmount) < 5 && (
                  <p className="text-xs text-red-600">Minimum purchase amount is $5.00</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-amount">You'll receive</Label>
                <Input id="asset-amount" placeholder="0.00000000" value={assetAmount} readOnly className="bg-muted" />
              </div>
            </div>

            {/* Transaction Fee Display */}
            {selectedCrypto && usdAmount && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${Number.parseFloat(usdAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Transaction Fee:</span>
                  <span className="font-medium">${transactionFeeAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-medium">Total Amount:</span>
                  <span className="text-lg font-semibold">${totalAmountWithFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm text-muted-foreground">NGN Equivalent:</span>
                  <span className="text-lg font-semibold">₦{ngnEquivalent}</span>
                </div>
              </div>
            )}

            {/* Wallet Address Input */}
            {selectedAsset && (
              <div className="space-y-2">
                {selectedCrypto?.category === "fiat" ? (
                  <>
                    <Label htmlFor="email-address">Your {selectedAsset} Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder={`Enter your ${selectedAsset.toLowerCase()} email address`}
                      value={emailAddress}
                      onChange={(e) => handleEmailAddressChange(e.target.value)}
                      maxLength={255}
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor="wallet-address">
                      Your {selectedAsset} Wallet Address
                      {requiresNetwork && selectedNetwork && ` (${selectedNetwork})`}
                    </Label>
                    <Input
                      id="wallet-address"
                      placeholder="Enter your wallet address"
                      value={walletAddress}
                      onChange={(e) => handleWalletAddressChange(e.target.value)}
                      maxLength={255}
                    />
                  </>
                )}
              </div>
            )}

            {/* Buy Button */}
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={
                    !selectedAsset ||
                    !usdAmount ||
                    !isAmountValid ||
                    (requiresNetwork && !selectedNetwork) ||
                    (selectedCrypto?.category === "fiat" && !emailAddress) ||
                    (selectedCrypto?.category !== "fiat" && !walletAddress) ||
                    timerExpired
                  }
                >
                  Approve Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Confirm Purchase</DialogTitle>
                  <DialogDescription>Please review your purchase details and complete the payment</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                  <div className="space-y-4 pb-4">
                    {/* Purchase Summary */}
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Asset:</span>
                        <span className="font-medium">
                          {selectedCrypto?.name} ({selectedAsset})
                        </span>
                      </div>
                      {requiresNetwork && selectedNetwork && (
                        <div className="flex justify-between">
                          <span>Network:</span>
                          <span className="font-medium">{selectedNetwork}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">
                          {selectedCrypto?.category === "fiat" ? `$${usdAmount}` : `${assetAmount} ${selectedAsset}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transaction Fee:</span>
                        <span className="font-medium">${transactionFeeAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Total (USD):</span>
                        <span className="font-medium">${totalAmountWithFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Total (NGN):</span>
                        <span className="font-bold">₦{ngnEquivalent}</span>
                      </div>
                    </div>

                    {/* Admin Bank Details */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Payment Details</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          <strong>Bank:</strong> First Bank Nigeria
                        </p>
                        <p>
                          <strong>Account Name:</strong> Bifimoto Exchange Ltd
                        </p>
                        <p>
                          <strong>Account Number:</strong> 1234567890
                        </p>
                        <p>
                          <strong>Narration/Description:</strong>{" "}
                          {selectedCrypto?.category === "fiat"
                            ? emailAddress.slice(-7).toUpperCase()
                            : walletAddress.slice(-7).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Upload Proof - Required */}
                    <div className="space-y-2">
                      <Label>Upload Payment Proof (Required)</Label>
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
                                size="sm"
                                onClick={removeFile}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-green-600">
                              {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2"
                            >
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

                    {/* Wallet Address Display */}
                    {(walletAddress || emailAddress) && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">
                          {selectedCrypto?.category === "fiat"
                            ? `Your ${selectedAsset} Email Address`
                            : `Your ${selectedAsset} Wallet Address${requiresNetwork && selectedNetwork ? ` (${selectedNetwork})` : ""}`}
                        </h4>
                        <p className="text-sm text-green-800 font-mono break-all">
                          {selectedCrypto?.category === "fiat" ? emailAddress : walletAddress}
                        </p>
                      </div>
                    )}

                    {/* Enhanced Countdown Timer */}
                    <CountdownTimer
                      initialMinutes={15}
                      onExpire={handleTimerExpire}
                      variant="warning"
                      title="Complete payment within"
                    />
                  </div>
                </div>

                <div className="flex-shrink-0 pt-4 border-t">
                  <Button className="w-full" onClick={handleTransactionSubmit} disabled={!uploadedFile || timerExpired || isSubmittingOrder}>
                    {isSubmittingOrder ? "Submitting order…" : "Submit Purchase"}
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
