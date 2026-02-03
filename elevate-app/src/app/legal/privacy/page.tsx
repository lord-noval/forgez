"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/signup">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card variant="glass-card" className="p-8">
          <h1 className="text-3xl font-bold font-display mb-6">Privacy Policy</h1>
          <p className="text-[var(--foreground-muted)] mb-4">
            Last updated: February 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-[var(--foreground-muted)]">
            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (email, password)</li>
                <li>Profile information (name, skills, projects)</li>
                <li>Content you upload (portfolio items, documents)</li>
                <li>Feedback and survey responses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our services</li>
                <li>Analyze your skills using AI</li>
                <li>Connect you with relevant opportunities</li>
                <li>Send important updates about your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">3. Data Protection (GDPR)</h2>
              <p>Under GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data,
                including encryption in transit and at rest, secure authentication,
                and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">5. Contact Us</h2>
              <p>
                For privacy-related inquiries, contact us at: privacy@forge-z.com
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
