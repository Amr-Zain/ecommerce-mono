import * as React from "react"

export default function ShowRoomsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Show Rooms</h1>
        <p className="text-sm text-muted-foreground">Visit our physical showrooms to experience products firsthand</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Our Locations</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Ottawa</strong> — 5500 ODA Level 4, Block A, Denis Park</li>
            <li><strong>Toronto</strong> — 123 Queen Street West, Suite 200</li>
            <li><strong>Vancouver</strong> — 456 Granville Street, Unit 12</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Store Hours</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Monday — Friday: 10:00 AM – 8:00 PM</li>
            <li>Saturday: 10:00 AM – 6:00 PM</li>
            <li>Sunday: 11:00 AM – 5:00 PM</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">What to Expect</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact Us</h2>
          <p>
            For questions about our showrooms, please contact us at shopix@gmail.com or call +1 415-559-9838.
          </p>
        </section>
      </div>
    </div>
  )
}
