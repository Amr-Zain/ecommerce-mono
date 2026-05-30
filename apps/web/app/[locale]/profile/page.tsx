"use client"

import * as React from "react"
import { Input } from "@ecommerce/ui/components/input"
import { Button } from "@ecommerce/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ecommerce/ui/components/select"

export default function ProfilePage() {
  return (
    <div className="space-y-12">
      {/* Personal Information */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Personal Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold">First Name<span className="text-destructive ps-1">*</span></label>
            <Input defaultValue="John" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Last Name<span className="text-destructive ps-1">*</span></label>
            <Input defaultValue="Doe" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Email Address<span className="text-destructive ps-1">*</span></label>
            <Input defaultValue="john@gmail.com" type="email" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Phone<span className="text-destructive ps-1">*</span></label>
            <Input defaultValue="123-456-0789" type="tel" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Birthday</label>
            <Input defaultValue="06-11-2002" type="date" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Gender</label>
            <Select defaultValue="male">
              <SelectTrigger className="data-[size=default]:h-11 w-full">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="h-11 px-8 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            Save changes
          </Button>
        </div>
      </section>

      {/* Address Information */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Address Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold">Country<span className="text-destructive ps-1">*</span></label>
            <Select defaultValue="usa">
              <SelectTrigger className="data-[size=default]:h-11 w-full">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usa">USA</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Region/State<span className="text-destructive ps-1">*</span></label>
            <Select defaultValue="california">
              <SelectTrigger className="data-[size=default]:h-11 w-full">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="california">California</SelectItem>
                <SelectItem value="newyork">New York</SelectItem>
                <SelectItem value="texas">Texas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">City<span className="text-destructive ps-1">*</span></label>
            <Select defaultValue="losangeles">
              <SelectTrigger className="data-[size=default]:h-11 w-full">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="losangeles">Los Angeles</SelectItem>
                <SelectItem value="sanfrancisco">San Francisco</SelectItem>
                <SelectItem value="sandiego">San Diego</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Post Code<span className="text-destructive ps-1">*</span></label>
            <Input defaultValue="90001" className="h-11" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold border-2">
            + Add new
          </Button>
          <Button className="h-11 px-8 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            Save changes
          </Button>
        </div>
      </section>

      {/* Change Password */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Change Password</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold">Old Password<span className="text-destructive ps-1">*</span></label>
            <Input type="password" defaultValue="password123" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">New Password<span className="text-destructive ps-1">*</span></label>
            <Input type="password" defaultValue="password123" className="h-11" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-bold">Confirm Password<span className="text-destructive ps-1">*</span></label>
            <Input type="password" defaultValue="password123" className="h-11" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="h-11 px-8 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
            Save changes
          </Button>
        </div>
      </section>
    </div>
  )
}
