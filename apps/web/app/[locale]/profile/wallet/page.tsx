"use client"

import { History, PlusSignIcon, Wallet01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { useForm } from "react-hook-form"
import { useTranslations } from "next-intl"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@ecommerce/ui/components/alert-dialog"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@ecommerce/ui/components/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@ecommerce/ui/components/empty"
import { ListingPagination } from "@/components/shared/pagination"
import {
  useCancelWalletWithdrawal, useCreateWalletDeposit, useCreateWalletWithdrawal,
  useCancelWalletDeposit, useVerifyWalletDeposit,
  useWallet, useWalletTransactions, useWalletWithdrawals, type WalletWithdrawal,
} from "@/hooks/api/use-wallet"
import { AppFormComplete, type FormField } from "@ecommerce/forms"

const money = (amount: number, currency = "SAR") => `${currency} ${Number(amount).toFixed(2)}`
const date = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "-"
const withdrawalStatuses = ["requested", "approved", "paid", "rejected", "failed", "cancelled_by_client"]
const transactionStatuses = ["pending", "completed", "failed", "cancelled", "expired", "reversed", "requires_review"]
type DepositFormValues = { amount: string }
type WithdrawalFormValues = {
  amount: string
  bank: string
  accountName: string
  iban: string
  note: string
}

function CancelWithdrawalDialog({ withdrawal }: { withdrawal: WalletWithdrawal }) {
  const cancel = useCancelWalletWithdrawal(withdrawal.id)
  const t2 = useTranslations("Wallet")
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size="sm" variant="outline" disabled={cancel.isPending} />}>{t2("cancel")}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t2("cancelWithdrawalTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t2("cancelWithdrawalDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t2("keepRequest")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => cancel.mutate({})}>{t2("confirmCancellation")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function WalletPage() {
  const searchParams = useSearchParams()
  const depositId = searchParams.get("deposit_id")
  const depositStatus = searchParams.get("deposit_status")
  const withdrawalPage = Math.max(1, Number(searchParams.get("withdrawals_page") || 1))
  const withdrawalStatus = searchParams.get("withdrawals_status")
  const transactionPage = Math.max(1, Number(searchParams.get("transactions_page") || 1))
  const transactionStatus = searchParams.get("transactions_status")
  const t = useTranslations("Wallet")
  const wallet = useWallet()
  const transactions = useWalletTransactions(transactionPage, 10, transactionStatus)
  const withdrawals = useWalletWithdrawals(withdrawalPage, 5, withdrawalStatus)
  const deposit = useCreateWalletDeposit()
  const verifyDeposit = useVerifyWalletDeposit(depositId)
  const cancelDeposit = useCancelWalletDeposit(depositId)
  const withdrawal = useCreateWalletWithdrawal()
  const depositForm = useForm<DepositFormValues>({
    defaultValues: { amount: "" },
    mode: "onChange",
  })
  const withdrawalForm = useForm<WithdrawalFormValues>({
    defaultValues: {
      amount: "",
      bank: "",
      accountName: "",
      iban: "",
      note: "",
    },
    mode: "onChange",
  })
  const depositAmount = depositForm.watch("amount")
  const withdrawAmount = withdrawalForm.watch("amount")
  const bank = withdrawalForm.watch("bank")
  const accountName = withdrawalForm.watch("accountName")
  const iban = withdrawalForm.watch("iban")
  const handledDepositReturn = React.useRef(false)

  React.useEffect(() => {
    if (handledDepositReturn.current || !depositId || !depositStatus) return
    handledDepositReturn.current = true
    if (depositStatus === "success") {
      verifyDeposit.mutate({})
      return
    }
    if (depositStatus === "cancelled") {
      cancelDeposit.mutate({})
    }
  }, [cancelDeposit, depositId, depositStatus, verifyDeposit])

  const data = wallet.data
  const availableBalance = data?.available_balance ?? data?.availableBalance ?? 0
  const pendingBalance = data?.pending_balance ?? data?.pendingBalance ?? 0
  const submitDeposit = (values: DepositFormValues) => {
    deposit.mutate(
      { amount: Number(values.amount), paymentMethod: "stripe_checkout" },
      { onSuccess: (response) => { if (response.data.redirect_url) window.location.assign(response.data.redirect_url) } }
    )
  }

  const submitWithdrawal = (values: WithdrawalFormValues) => {
    const amount = Number(values.amount || 0)
    if (amount < 1 || amount > availableBalance) return
    withdrawal.mutate({
      amount,
      method: "bank_transfer",
      details: {
        bank: values.bank,
        accountName: values.accountName,
        iban: values.iban,
      },
      note: values.note || undefined,
    })
  }

  if (wallet.isPending) return <p className="text-sm text-muted-foreground">{t("loading")}</p>
  const withdrawalAmountNumber = Number(withdrawAmount || 0)
  const withdrawalExceedsBalance = withdrawalAmountNumber > availableBalance
  const withdrawalSubmitDisabled =
    withdrawal.isPending ||
    withdrawalAmountNumber < 1 ||
    withdrawalExceedsBalance ||
    !bank ||
    !accountName ||
    !iban
  const withdrawalItems = withdrawals.data?.items ?? []
  const withdrawalMeta = withdrawals.data?.meta
  const withdrawalTotalPages =
    withdrawalMeta?.total_pages ??
    Math.max(1, Math.ceil((withdrawalMeta?.total ?? 0) / (withdrawalMeta?.limit ?? 5)))
  const transactionItems = transactions.data?.items ?? []
  const transactionMeta = transactions.data?.meta
  const transactionTotalPages =
    transactionMeta?.total_pages ??
    Math.max(1, Math.ceil((transactionMeta?.total ?? 0) / (transactionMeta?.limit ?? 10)))
  const walletPageHref = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams()
    const values = {
      withdrawals_status: withdrawalStatus,
      withdrawals_page: withdrawalPage > 1 ? String(withdrawalPage) : null,
      transactions_status: transactionStatus,
      transactions_page: transactionPage > 1 ? String(transactionPage) : null,
      ...updates,
    }

    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value)
    }

    const query = params.toString()
    return query ? `/profile/wallet?${query}` : "/profile/wallet"
  }
  const depositFields: FormField<DepositFormValues>[] = [
    {
      type: "number",
      name: "amount",
      placeholder: t("amount"),
      required: true,
      inputProps: {
        required: true,
        min: 1,
        disabled: deposit.isPending,
      },
    },
  ]
  const withdrawalFields: FormField<WithdrawalFormValues>[] = [
    {
      type: "number",
      name: "amount",
      placeholder: t("amount"),
      required: true,
      description: `${t("availableToWithdraw", { amount: money(availableBalance, data?.currency) })}${
        withdrawalExceedsBalance
          ? t("exceedsBalance")
          : ""
      }`,
      inputProps: {
        required: true,
        min: 1,
        max: availableBalance,
        disabled: withdrawal.isPending,
      },
    },
    {
      type: "text",
      name: "bank",
      placeholder: t("bankName"),
      required: true,
      inputProps: {
        required: true,
        disabled: withdrawal.isPending,
      },
    },
    {
      type: "text",
      name: "accountName",
      placeholder: t("accountHolderName"),
      required: true,
      inputProps: {
        required: true,
        disabled: withdrawal.isPending,
      },
    },
    {
      type: "text",
      name: "iban",
      placeholder: t("iban"),
      required: true,
      inputProps: {
        required: true,
        disabled: withdrawal.isPending,
      },
    },
    {
      type: "textarea",
      name: "note",
      placeholder: t("optionalNote"),
      inputProps: {
        disabled: withdrawal.isPending,
      },
    },
  ]

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/10 px-8 py-10">
        <h1 className="text-4xl font-extrabold">{money(availableBalance, data?.currency)}</h1>
        <p className="text-sm text-muted-foreground">{t("availableBalance")}</p>
        <p className="mt-3 text-sm font-semibold">{t("reservedOrPending", { amount: money(pendingBalance, data?.currency) })}</p>
        <Badge className="mt-3" variant="outline">{data?.status ?? t("unknown")}</Badge>
      </div>
      {(verifyDeposit.isPending || cancelDeposit.isPending) && (
        <p className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {t("updatingDeposit")}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Dialog>
          <DialogTrigger render={<Button />}><HugeiconsIcon icon={PlusSignIcon} /> {t("addFunds")}</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("addFundsTitle")}</DialogTitle><DialogDescription>{t("addFundsDescription")}</DialogDescription></DialogHeader>
            <AppFormComplete
              form={depositForm}
              fields={depositFields}
              onSubmit={submitDeposit}
              isLoading={deposit.isPending}
              submitDisabled={Number(depositAmount) < 1}
              submitButtonText={t("continueToPayment")}
              loadingButtonText={t("starting")}
            />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>{t("requestWithdrawal")}</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("requestWithdrawalTitle")}</DialogTitle><DialogDescription>{t("requestWithdrawalDescription")}</DialogDescription></DialogHeader>
            <AppFormComplete
              form={withdrawalForm}
              fields={withdrawalFields}
              onSubmit={submitWithdrawal}
              isLoading={withdrawal.isPending}
              submitDisabled={withdrawalSubmitDisabled}
              submitButtonText={t("submitRequest")}
              loadingButtonText={t("submitting")}
            />
          </DialogContent>
        </Dialog>
      </div>

      <section className="space-y-4">
        <div className="space-y-3">
          <h2 className="font-bold">{t("withdrawalRequests")}</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={walletPageHref({ withdrawals_status: null, withdrawals_page: null })}>
              <Badge variant={!withdrawalStatus ? "default" : "outline"} className="cursor-pointer">
                {t("all")}
              </Badge>
            </Link>
            {withdrawalStatuses.map((status) => (
              <Link key={status} href={walletPageHref({ withdrawals_status: status, withdrawals_page: null })}>
                <Badge
                  variant={withdrawalStatus === status ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                >
                  {status.replaceAll("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
        {withdrawals.isPending ? (
          <p className="text-sm text-muted-foreground">{t("loadingWithdrawals")}</p>
        ) : withdrawalItems.length === 0 ? <p className="text-sm text-muted-foreground">{t("noWithdrawals")}</p> : withdrawalItems.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div><p className="font-semibold">{money(item.amount, item.currency)}</p><p className="text-xs text-muted-foreground">{date(item.requested_at ?? item.requestedAt)}</p></div>
            <div className="flex items-center gap-2"><Badge variant="outline">{item.status}</Badge>{item.status === "requested" && <CancelWithdrawalDialog withdrawal={item} />}</div>
          </div>
        ))}
        <ListingPagination
          pathname="/profile/wallet"
          pageParam="withdrawals_page"
          searchParams={{
            withdrawals_status: withdrawalStatus || undefined,
            transactions_status: transactionStatus || undefined,
            transactions_page: transactionPage > 1 ? String(transactionPage) : undefined,
          }}
          currentPage={withdrawalPage}
          totalPages={withdrawalTotalPages}
        />
      </section>

      <section className="space-y-4 border-t pt-6">
        <div className="space-y-3">
          <h2 className="font-bold">{t("transactionHistory")}</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={walletPageHref({ transactions_status: null, transactions_page: null })}>
              <Badge variant={!transactionStatus ? "default" : "outline"} className="cursor-pointer">
                {t("all")}
              </Badge>
            </Link>
            {transactionStatuses.map((status) => (
              <Link key={status} href={walletPageHref({ transactions_status: status, transactions_page: null })}>
                <Badge
                  variant={transactionStatus === status ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                >
                  {status.replaceAll("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
        {transactions.isPending ? (
          <p className="text-sm text-muted-foreground">{t("loadingTransactions")}</p>
        ) : transactionItems.length === 0 ? (
          <Empty className="border-0 bg-muted/20 py-12"><EmptyHeader><EmptyMedia variant="icon"><HugeiconsIcon icon={History} /></EmptyMedia><EmptyTitle>{t("noTransactions")}</EmptyTitle><EmptyDescription>{t("noTransactionsDescription")}</EmptyDescription></EmptyHeader></Empty>
        ) : transactionItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="flex items-center gap-3"><HugeiconsIcon icon={Wallet01Icon} /><div><p className="font-semibold capitalize">{item.description || item.type}</p><p className="text-xs text-muted-foreground">{date(item.created_at ?? item.createdAt)}</p></div></div>
            <div className="text-end"><p className={item.direction === "credit" ? "font-bold text-emerald-600" : "font-bold text-destructive"}>{item.direction === "credit" ? "+" : "-"}{money(item.amount, item.currency)}</p><Badge variant="outline">{item.status}</Badge></div>
          </div>
        ))}
        <ListingPagination
          pathname="/profile/wallet"
          pageParam="transactions_page"
          searchParams={{
            withdrawals_status: withdrawalStatus || undefined,
            withdrawals_page: withdrawalPage > 1 ? String(withdrawalPage) : undefined,
            transactions_status: transactionStatus || undefined,
          }}
          currentPage={transactionPage}
          totalPages={transactionTotalPages}
        />
      </section>
    </div>
  )
}
