import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ecommerce/ui/components/dialog";
import { cn } from "@/lib/utils";

export function Modal({
  triggle,
  title,
  desc,
  children,
  isOpen,
  setIsOpen,
  contentClass,
}: {
  triggle?: React.ReactNode
  children: React.ReactNode
  title?: string
  desc?: string
  contentClass?: string
  isOpen: boolean
  setIsOpen: (show: boolean) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggle && <DialogTrigger>{triggle}</DialogTrigger>}
      <DialogContent className={cn('p-0 rounded-3xl', contentClass)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{desc}</DialogDescription>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}