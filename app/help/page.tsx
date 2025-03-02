'use client'
import React, { useState } from "react";

const Page = () => {
  const [showTicketForm, setShowTicketForm] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800 text-neutral-900 dark:text-white">
      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-light tracking-tight">Atoma Help</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-light mb-6">
            How can we assist you today?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-12">
            Get quick solutions to your questions or open a support ticket for
            personalized help.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-4 mb-16">
            <button
              onClick={() => setShowTicketForm(!showTicketForm)}
              className="px-8 py-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              {showTicketForm ? "Hide Ticket Form" : "Open a Ticket"}
            </button>
            <a
              href="#faq"
              className="px-8 py-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              Browse FAQ
            </a>
            <a
              href="#contact"
              className="px-8 py-3 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              Contact Support
            </a>
          </div>

          {/* Ticket Form - Conditionally Rendered */}
          {showTicketForm && (
            <div className="w-full p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl mb-16">
              <h3 className="text-xl font-medium mb-6">
                Create Support Ticket
              </h3>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option>Technical Issue</option>
                    <option>Billing Question</option>
                    <option>Feature Request</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    placeholder="Please provide details about your issue"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Submit Ticket
                </button>
              </form>
            </div>
          )}

          {/* Popular FAQs Preview */}
          <div id="faq">
            <h3 className="text-xl font-medium mb-4">Popular FAQs</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="block p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  How do I reset my password?
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  When will my subscription renew?
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                >
                  How can I update my billing information?
                </a>
              </li>
            </ul>
            <a
              href="#"
              className="inline-block mt-4 text-purple-600 dark:text-blue-400"
            >
              View all FAQs →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-8 text-sm text-neutral-500">
        <p>
          Need immediate assistance?{" "}
          <a href="#" className="text-purple-600 dark:text-blue-400">
            Chat with us
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Page;
