"use client"

import { History, PlusSignIcon, Wallet01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@ecommerce/ui/components/alert-dialog"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@ecommerce/ui/components/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@ecommerce/ui/components/empty"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import {
  useCancelWalletWithdrawal, useCreateWalletDeposit, useCreateWalletWithdrawal,
  useWallet, useWalletTransactions, useWalletWithdrawals, type WalletWithdrawal,
} from "@/hooks/api/use-wallet"

const money = (amount: number, currency = "SAR") => `${currency} ${Number(amount).toFixed(2)}`
const date = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))

function CancelWithdrawalDialog({ withdrawal }: { withdrawal: WalletWithdrawal }) {
  const cancel = useCancelWalletWithdrawal(withdrawal.id)
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="sm" variant="outline" disabled={cancel.isPending} />}>Cancel</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel withdrawal request?</AlertDialogTitle>
          <AlertDialogDescription>The reserved amount will return to your available balance.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Request</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => cancel.mutate({})}>Confirm Cancellation</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function WalletPage() {
  const wallet = useWallet()
  const transactions = useWalletTransactions()
  const withdrawals = useWalletWithdrawals()
  const deposit = useCreateWalletDeposit()
  const withdrawal = useCreateWalletWithdrawal()
  const [depositAmount, setDepositAmount] = React.useState("")
  const [withdrawAmount, setWithdrawAmount] = React.useState("")
  const [bank, setBank] = React.useState("")
  const [accountName, setAccountName] = React.useState("")
  const [iban, setIban] = React.useState("")
  const [note, setNote] = React.useState("")

  const submitDeposit = () => {
    deposit.mutate(
      { amount: Number(depositAmount), paymentMethod: "stripe_checkout" },
      { onSuccess: (response) => { if (response.data.redirect_url) window.location.assign(response.data.redirect_url) } }
    )
  }

  const submitWithdrawal = () => {
    withdrawal.mutate({
      amount: Number(withdrawAmount),
      method: "bank_transfer",
      details: { bank, accountName, iban },
      note: note || undefined,
    })
  }

  if (wallet.isPending) return <p className="text-sm text-muted-foreground">Loading wallet...</p>
  const data = wallet.data

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/10 px-8 py-10">
        <h1 className="text-4xl font-extrabold">{money(data?.available_balance ?? 0, data?.currency)}</h1>
        <p className="text-sm text-muted-foreground">Available Balance</p>
        <p className="mt-3 text-sm font-semibold">Pending: {money(data?.pending_balance ?? 0, data?.currency)}</p>
        <Badge className="mt-3" variant="outline">{data?.status ?? "unknown"}</Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger render={<Button />}><HugeiconsIcon icon={PlusSignIcon} /> Add Funds</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Funds</DialogTitle><DialogDescription>Deposit through Stripe Checkout.</DialogDescription></DialogHeader>
            <Input type="number" min={1} placeholder="Amount" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} />
            <DialogFooter><Button onClick={submitDeposit} disabled={deposit.isPending || Number(depositAmount) < 1}>{deposit.isPending ? "Starting..." : "Continue to Payment"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Request Withdrawal</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request Withdrawal</DialogTitle><DialogDescription>Withdrawals are reviewed and paid manually.</DialogDescription></DialogHeader>
            <div className="grid gap-3">
              <Input type="number" min={1} placeholder="Amount" value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} />
              <Input placeholder="Bank name" value={bank} onChange={(event) => setBank(event.target.value)} />
              <Input placeholder="Account holder name" value={accountName} onChange={(event) => setAccountName(event.target.value)} />
              <Input placeholder="IBAN / account number" value={iban} onChange={(event) => setIban(event.target.value)} />
              <Textarea placeholder="Optional note" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
            <DialogFooter><Button onClick={submitWithdrawal} disabled={withdrawal.isPending || Number(withdrawAmount) < 1 || !bank || !accountName || !iban}>{withdrawal.isPending ? "Submitting..." : "Submit Request"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section className="space-y-4">
        <h2 className="font-bold">Withdrawal Requests</h2>
        {(withdrawals.data?.length ?? 0) === 0 ? <p className="text-sm text-muted-foreground">No withdrawal requests.</p> : withdrawals.data?.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div><p className="font-semibold">{money(item.amount, item.currency)}</p><p className="text-xs text-muted-foreground">{date(item.requested_at)}</p></div>
            <div className="flex items-center gap-2"><Badge variant="outline">{item.status}</Badge>{item.status === "requested" && <CancelWithdrawalDialog withdrawal={item} />}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4 border-t pt-6">
        <h2 className="font-bold">Transaction History</h2>
        {(transactions.data?.length ?? 0) === 0 ? (
          <Empty className="border-0 bg-muted/20 py-12"><EmptyHeader><EmptyMedia variant="icon"><HugeiconsIcon icon={History} /></EmptyMedia><EmptyTitle>No transactions yet</EmptyTitle><EmptyDescription>Your wallet activity will appear here.</EmptyDescription></EmptyHeader></Empty>
        ) : transactions.data?.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="flex items-center gap-3"><HugeiconsIcon icon={Wallet01Icon} /><div><p className="font-semibold capitalize">{item.description || item.type}</p><p className="text-xs text-muted-foreground">{date(item.created_at)}</p></div></div>
            <div className="text-end"><p className={item.direction === "credit" ? "font-bold text-emerald-600" : "font-bold text-destructive"}>{item.direction === "credit" ? "+" : "-"}{money(item.amount, item.currency)}</p><Badge variant="outline">{item.status}</Badge></div>
          </div>
        ))}
      </section>
    </div>
  )
}
