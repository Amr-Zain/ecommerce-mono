"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@ecommerce/ui/components/badge"
import { Button } from "@ecommerce/ui/components/button"
import { Input } from "@ecommerce/ui/components/input"
import { Textarea } from "@ecommerce/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ecommerce/ui/components/dialog"
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

type Address = {
  id: string
  title: string
  name: string
  address: string
  isDefault: boolean
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "1",
    title: "Home",
    name: "Carlyle Hall",
    address: "25 Union Square W,\nNew York, NY 10003, USA",
    isDefault: true,
  },
  {
    id: "2",
    title: "Office",
    name: "Parkside Residence",
    address: "18 East 16th Street, Apt 7C\nNew York, NY 10003, USA",
    isDefault: false,
  },
  {
    id: "3",
    title: "Home 2",
    name: "Union Square Office",
    address: "25 Union Square West, Floor 5\nNew York, NY 10003, USA",
    isDefault: false,
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = React.useState<Address[]>(INITIAL_ADDRESSES)
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null)
  
  // Form States
  const [formData, setFormData] = React.useState({ title: "", name: "", address: "" })

  const handleOpenAdd = () => {
    setFormData({ title: "", name: "", address: "" })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (addr: Address) => {
    setFormData({ title: addr.title, name: addr.name, address: addr.address })
    setEditingAddress(addr)
  }

  const handleSaveAdd = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      isDefault: addresses.length === 0,
    }
    setAddresses([...addresses, newAddress])
    setIsAddOpen(false)
  }

  const handleSaveEdit = () => {
    if (!editingAddress) return
    setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...a, ...formData } : a))
    setEditingAddress(null)
  }

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Addresses</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{addr.title}</h3>
                {addr.isDefault && (
                  <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10 font-semibold rounded-full px-2.5 py-0.5 text-[10px]">
                    Default
                  </Badge>
                )}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{addr.name}</p>
                <p className="whitespace-pre-line leading-relaxed">{addr.address}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs font-semibold">
              <button 
                onClick={() => handleOpenEdit(addr)}
                className="text-foreground hover:underline"
              >
                Edit
              </button>

              <AlertDialog>
                <AlertDialogTrigger>
                  <button className="text-foreground hover:underline">Remove</button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your address 
                      "{addr.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(addr.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {!addr.isDefault && (
                <button 
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-foreground hover:underline"
                >
                  Set as Default
                </button>
              )}
            </div>
          </div>
        ))}
        
        {/* Add Address Card */}
        <button 
          onClick={handleOpenAdd}
          className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-5 text-muted-foreground hover:border-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <HugeiconsIcon icon={PlusSignIcon} className="size-6" strokeWidth={2} />
          <span className="font-bold">Add Address</span>
        </button>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Address</DialogTitle>
            <DialogDescription>
              Enter the details for your new address here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input 
                id="title" 
                placeholder="e.g. Home, Office" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Full Name</label>
              <Input 
                id="name" 
                placeholder="e.g. John Doe" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">Address</label>
              <Textarea 
                id="address" 
                placeholder="Enter full address..." 
                className="resize-y"
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveAdd}>Save Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={!!editingAddress} onOpenChange={(open) => !open && setEditingAddress(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Make changes to your address here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input 
                id="edit-title" 
                placeholder="e.g. Home, Office" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">Full Name</label>
              <Input 
                id="edit-name" 
                placeholder="e.g. John Doe" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-address" className="text-sm font-medium">Address</label>
              <Textarea 
                id="edit-address" 
                placeholder="Enter full address..." 
                className="resize-y"
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
