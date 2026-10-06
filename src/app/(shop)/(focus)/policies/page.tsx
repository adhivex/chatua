import type { Metadata } from "next";
import { BackBar } from "@/components/layout/BackBar";
import { DELIVERY } from "@/lib/delivery";
import { formatINR } from "@/lib/money";
import { INSTAGRAM_URL, supportEmail, whatsappNumber } from "@/lib/site";

export const metadata: Metadata = {
  title: "Delivery, returns and privacy",
  description: "Delivery charges and times, payment options, returns and how Chatua handles your personal details.",
  alternates: { canonical: "/policies" },
};

// Only states rules confirmed in the PRD. Owner-specific wording (returns window, legal entity,
// GST, FSSAI) is listed in docs/LAUNCH-CHECKLIST.md and must be added before launch.
export default function PoliciesPage() {
  const email = supportEmail();
  const wa = whatsappNumber();
  const contact = (
    <>
      {wa && <>WhatsApp +{wa}, </>}
      {email && <>email {email}, </>}
      or a message on{" "}
      <a href={INSTAGRAM_URL} className="font-semibold text-clay" target="_blank" rel="noopener noreferrer">
        Instagram @chatua.in
      </a>
    </>
  );
  const h = "mb-2 mt-6 font-head text-xl font-semibold";
  return (
    <main id="main" className="app-main">
      <BackBar title="Policies" />
      <article className="max-w-[62ch] px-[18px] pb-8 pt-2 text-[14.5px] leading-[1.6] text-[#4a3a2e]">
        <h2 className={h}>Delivery</h2>
        <p>We deliver across India.</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            {DELIVERY.STANDARD.label}: {DELIVERY.STANDARD.eta}, {formatINR(DELIVERY.STANDARD.fee)}. Free when your items total {formatINR(DELIVERY.FREE_ABOVE)} or more.
          </li>
          <li>
            {DELIVERY.EXPRESS.label}: {DELIVERY.EXPRESS.eta}, {formatINR(DELIVERY.EXPRESS.fee)}.
          </li>
        </ul>
        <p className="mt-2">Delivery times start when your order is confirmed. You can follow your order from the link on your order page.</p>

        <h2 className={h}>Payments</h2>
        <p>Pay by UPI, credit or debit card, net banking or cash on delivery. Online payments are processed securely by Razorpay; we never see or store your card or bank details. Prices are in Indian rupees.</p>

        <h2 className={h}>Cancellations and returns</h2>
        <p>If something is wrong with your order, or you need to cancel it before it ships, contact us with your order ID and we will help: {contact}. Refunds for online payments go back to the original payment method.</p>

        <h2 className={h}>Privacy</h2>
        <p>
          To deliver your order we keep your name, mobile number and delivery address, and the items you bought. We use them only to deliver your order and contact you about it, and share them only with our delivery partner and payment provider for that purpose.
        </p>
        <p className="mt-2">Your cart and favourites are saved on your own device, not on our servers. We do not use advertising cookies.</p>
        <p className="mt-2">To see or delete the details we hold about you, contact us: {contact}.</p>
      </article>
    </main>
  );
}
