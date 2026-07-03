"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ecommerce/ui/components/alert-dialog"
import { Button } from "@ecommerce/ui/components/button"
import { useCancelOrder } from "@/hooks/api/use-profile-commerce"

function CancelOrderDialog({
  orderId,
  size,
}: {
  orderId: string
  size?: "sm" | "default"
}) {
  const cancelOrder = useCancelOrder(orderId)

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            size={size}
            variant="destructive"
            disabled={cancelOrder.isPending}
          />
        }
      >
        {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. If payment was already captured, any
            eligible refund will be processed according to the order payment
            method.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Order</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={cancelOrder.isPending}
            onClick={() =>
              cancelOrder.mutate({ reason: "Cancelled by client" })
            }
          >
            {cancelOrder.isPending ? "Cancelling..." : "Confirm Cancellation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { CancelOrderDialog }
