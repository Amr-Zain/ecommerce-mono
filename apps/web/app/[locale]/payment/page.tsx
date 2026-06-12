import * as React from "react"

export default function PaymentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payment</h1>
        <p className="text-sm text-muted-foreground">Secure payment options for your purchases</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Accepted Payment Methods</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Visa, Mastercard, American Express</li>
            <li>PayPal</li>
            <li>Apple Pay & Google Pay</li>
            <li>Bank transfers (select regions)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Secure Checkout</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nulla facilisi. Integer lacinia sollicitudin massa, nec varius nunc tincidunt in.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Currency & Pricing</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <p>
            All prices are displayed in USD. Taxes and duties are calculated at checkout based on your shipping destination.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about payment, please contact our support team at shopix@gmail.com.
          </p>
        </section>
      </div>
    </div>
  )
}
