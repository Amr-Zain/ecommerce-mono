import * as React from "react"

export const dynamic = "force-static"

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Returns & Exchanges</h1>
        <p className="text-sm text-muted-foreground">
          We want you to love your purchase. If something isnt right, we are here to help.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Return Policy</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Items must be returned within 30 days of delivery</li>
            <li>Products must be unused and in original packaging</li>
            <li>Free returns on defective or damaged items</li>
            <li>Refunds are processed within 5-7 business days</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">How to Return an Item</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nulla facilisi.
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Log into your account and go to your orders</li>
            <li>Select the item you wish to return</li>
            <li>Choose a reason for the return</li>
            <li>Print the prepaid shipping label</li>
            <li>Drop off the package at any authorized location</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Exchange Policy</h2>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about returns or exchanges, please contact our support team at shopix@gmail.com or visit our Help page.
          </p>
        </section>
      </div>
    </div>
  )
}
