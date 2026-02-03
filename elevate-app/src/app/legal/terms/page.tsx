"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold font-display mb-6">Terms of Service</h1>
          <p className="text-[var(--foreground-muted)] mb-4">
            Last updated: February 2026
          </p>

          <div className="prose prose-invert max-w-none space-y-6 text-[var(--foreground-muted)]">
            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using FORGE-Z, you agree to be bound by these Terms of Service.
                If you do not agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">2. Description of Service</h2>
              <p>
                FORGE-Z is a career exploration platform that helps users discover their
                professional archetype, build portfolios, and connect with opportunities
                in engineering and technical fields.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate information when creating an account</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must be at least 13 years old to use this service</li>
                <li>One person or entity may not maintain multiple accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">4. User Content</h2>
              <p>You retain ownership of content you upload. By uploading content, you grant us a license to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Store and display your content on the platform</li>
                <li>Analyze content using AI to extract skills and insights</li>
                <li>Use aggregated, anonymized data to improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">5. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload malicious content or malware</li>
                <li>Impersonate others or misrepresent your identity</li>
                <li>Attempt to access other users accounts</li>
                <li>Use the service for illegal purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">6. Termination</h2>
              <p>
                We may terminate or suspend your account at any time for violations of these terms.
                You may delete your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">7. Limitation of Liability</h2>
              <p>
                FORGE-Z is provided as is without warranties of any kind. We are not liable
                for any damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-3">8. Contact</h2>
              <p>
                For questions about these terms, contact us at: legal@forge-z.com
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
