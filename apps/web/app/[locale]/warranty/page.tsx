import * as React from "react"

export const dynamic = "force-static"

export default function WarrantyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Warranty</h1>
        <p className="text-sm text-muted-foreground">Information about product warranties and coverage</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Warranty Coverage</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>1-year limited warranty on all electronics</li>
            <li>2-year warranty on major appliances</li>
            <li>Lifetime warranty on select premium products</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What Is Covered</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Manufacturing defects</li>
            <li>Faulty materials or workmanship</li>
            <li>Hardware malfunctions under normal use</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What Is Not Covered</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Damage caused by accidents or misuse</li>
            <li>Normal wear and tear</li>
            <li>Unauthorized repairs or modifications</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">How to File a Warranty Claim</h2>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Contact our support team with your order details</li>
            <li>Provide a description of the issue</li>
            <li>Submit photos or documentation if required</li>
            <li>Receive a prepaid shipping label for returns</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <p>
            For warranty inquiries, please email us at shopix@gmail.com or visit our Help page.
          </p>
        </section>
      </div>
    </div>
  )
}
