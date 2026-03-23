import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/footer";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Accordion } from "@/components/ui/accordion";

const faqs = [
  {
    id: "faq-1",
    title: "How does settlement work?",
    content:
      "At the end of each 7-day selling window, performance is evaluated. If completion is at least 70%, payout includes capital plus profit after commission.",
  },
  {
    id: "faq-2",
    title: "What if package sales do not reach 70%?",
    content:
      "The package purchase amount is refunded in full. No commission is charged on failed outcomes.",
  },
  {
    id: "faq-3",
    title: "Can I purchase multiple packages?",
    content:
      "Yes. Every package purchase is tracked independently with its own sales records and settlement result.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100">
      <main className="mx-auto max-w-6xl space-y-12 px-4 py-8 md:py-10">
        <Hero />
        <HowItWorks />
        <Features />
        <section id="faq" className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
          <Accordion items={faqs} />
        </section>
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
