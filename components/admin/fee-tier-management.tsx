"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getBrowserTradeOrderAdministrationUseCases } from "@/src/modules/trading/composition/browser"
import type { TradeFeeTier, TradeFeeTierDraft } from "@/src/modules/trading/domain/trade-order"

const assets = ["BTC", "ETH", "TON", "SOL", "BNB", "SUI", "PI", "USDC", "USDT", "PAYPAL", "SKRILL", "NETELLER"]
const blankTier: TradeFeeTierDraft = {
  side: "buy",
  assetSymbol: "BTC",
  minimumUsd: 0,
  maximumUsd: null,
  feeUsd: 0,
}

export function FeeTierManagement() {
  const [tiers, setTiers] = useState<TradeFeeTier[]>([])
  const [draft, setDraft] = useState<TradeFeeTierDraft>(blankTier)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function loadTiers() {
    try {
      setTiers(await getBrowserTradeOrderAdministrationUseCases().listFeeTiers())
    } catch (loadError) {
      console.error("Could not load trade fee tiers.", loadError)
      setError("Fee tiers could not be loaded. Confirm that the database migration has been applied.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTiers()
  }, [])

  function editTier(tier: TradeFeeTier) {
    setDraft({
      id: tier.id,
      side: tier.side,
      assetSymbol: tier.assetSymbol,
      minimumUsd: tier.minimumUsd,
      maximumUsd: tier.maximumUsd,
      feeUsd: tier.feeUsd,
    })
    setError(null)
    setSuccess(null)
  }

  function resetDraft() {
    setDraft(blankTier)
  }

  async function saveTier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      await getBrowserTradeOrderAdministrationUseCases().saveFeeTier({
        ...draft,
        assetSymbol: draft.assetSymbol.trim().toUpperCase(),
      })
      await loadTiers()
      resetDraft()
      setSuccess("Fee tier saved.")
    } catch (saveError) {
      console.error("Could not save trade fee tier.", saveError)
      setError(saveError instanceof Error ? saveError.message : "Fee tier could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  async function removeTier(tier: TradeFeeTier) {
    if (!window.confirm(`Delete the ${tier.side} ${tier.assetSymbol} fee range?`)) return
    setError(null)
    setSuccess(null)
    try {
      await getBrowserTradeOrderAdministrationUseCases().deleteFeeTier(tier.id)
      setTiers((current) => current.filter((entry) => entry.id !== tier.id))
      if (draft.id === tier.id) resetDraft()
      setSuccess("Fee tier deleted.")
    } catch (deleteError) {
      console.error("Could not delete trade fee tier.", deleteError)
      setError(deleteError instanceof Error ? deleteError.message : "Fee tier could not be deleted.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trade Fee Management</h1>
        <p className="text-muted-foreground">
          Configure fixed USD fees by transaction side, asset, and order amount. Orders require a matching tier.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{draft.id ? "Edit fee tier" : "Add fee tier"}</CardTitle>
          <CardDescription>
            Ranges include the minimum and exclude the maximum. Leave maximum empty for no upper limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveTier} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fee-side">Transaction side</Label>
              <select
                id="fee-side"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.side}
                onChange={(event) => setDraft((current) => ({
                  ...current,
                  side: event.target.value === "sell" ? "sell" : "buy",
                }))}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-asset">Asset / rail</Label>
              <select
                id="fee-asset"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.assetSymbol}
                onChange={(event) => setDraft((current) => ({ ...current, assetSymbol: event.target.value }))}
              >
                {assets.map((asset) => <option key={asset} value={asset}>{asset}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-min">Minimum order (USD)</Label>
              <Input id="fee-min" type="number" min="0" step="0.01" value={draft.minimumUsd}
                onChange={(event) => setDraft((current) => ({ ...current, minimumUsd: Number(event.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-max">Maximum order (USD)</Label>
              <Input id="fee-max" type="number" min="0.01" step="0.01" value={draft.maximumUsd ?? ""}
                onChange={(event) => setDraft((current) => ({
                  ...current,
                  maximumUsd: event.target.value === "" ? null : Number(event.target.value),
                }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-amount">Fixed fee (USD)</Label>
              <Input id="fee-amount" type="number" min="0" step="0.01" value={draft.feeUsd}
                onChange={(event) => setDraft((current) => ({ ...current, feeUsd: Number(event.target.value) }))} required />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save fee tier"}</Button>
              {draft.id && <Button type="button" variant="outline" onClick={resetDraft}>Cancel</Button>}
            </div>
          </form>
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          {success && <p role="status" className="mt-4 text-sm text-green-700">{success}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configured tiers</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Loading fee tiers...</p> : tiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tiers configured. Trading requests remain disabled until a matching tier is added.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left">
                  <th className="p-2">Side</th><th className="p-2">Asset</th><th className="p-2">USD range</th><th className="p-2">Fee</th><th className="p-2">Actions</th>
                </tr></thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr key={tier.id} className="border-b">
                      <td className="p-2 capitalize">{tier.side}</td>
                      <td className="p-2">{tier.assetSymbol}</td>
                      <td className="p-2">${tier.minimumUsd.toFixed(2)} – {tier.maximumUsd === null ? "No limit" : `$${tier.maximumUsd.toFixed(2)}`}</td>
                      <td className="p-2">${tier.feeUsd.toFixed(2)}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => editTier(tier)}>Edit</Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => void removeTier(tier)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
