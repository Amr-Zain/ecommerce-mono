import * as React from "react"

export default function PurchaseProtectionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Purchase Protection</h1>
        <p className="text-sm text-muted-foreground">Shop with confidence</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. What Is Covered</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Items that arrive damaged or defective</li>
            <li>Items that don't match the listing description</li>
            <li>Unauthorized purchases made on your account</li>
            <li>Items lost in transit</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Coverage Period</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nulla facilisi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. How to File a Claim</h2>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Contact our support team within 30 days of delivery</li>
            <li>Provide your order number and a description of the issue</li>
            <li>Include photos if applicable (damage, defect, etc.)</li>
            <li>We will review and respond within 2-3 business days</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Exclusions</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Normal wear and tear</li>
            <li>Damage caused by misuse or accidents</li>
            <li>Items returned after the 30-day window</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
