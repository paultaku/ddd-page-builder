"use client";

import { useState } from "react";

// Standalone main-application contact page (authored directly, not rendered from
// the seeded contact-us template). No backend yet — submit shows an inline
// acknowledgement.
export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">Contact us</h1>
          <p className="text-gray-600">
            Questions, feedback, or partnership ideas? We&apos;d love to hear
            from you.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
            <p className="font-medium text-green-800">
              Thanks — we&apos;ll be in touch shortly.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-sm font-medium text-green-700 hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm"
          >
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              Send message
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Or email us at{" "}
          <a
            href="mailto:hello@example.com"
            className="text-blue-600 hover:underline"
          >
            hello@example.com
          </a>
        </p>
      </section>
    </main>
  );
}
