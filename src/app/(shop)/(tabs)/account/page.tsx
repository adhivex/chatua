import type { Metadata } from "next";
import Link from "next/link";
import { BackBar } from "@/components/layout/BackBar";
import { SiteCredit } from "@/components/layout/SiteCredit";
import { BookIcon, CartIcon, ChatIcon, DocIcon, InfoIcon, RightIcon, TempleIcon, UserIcon } from "@/components/ui/icons";
import { INSTAGRAM_URL, supportEmail, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

const MENU = [
  { href: "/about", label: "What is Chatua?", Icon: InfoIcon },
  { href: "/heritage", label: "Our Odisha Heritage", Icon: TempleIcon },
  { href: "/recipes", label: "Recipes", Icon: BookIcon },
  { href: "/cart", label: "My Cart", Icon: CartIcon },
  { href: "/policies", label: "Delivery, returns and privacy", Icon: DocIcon },
];

export default function AccountPage() {
  const wa = whatsappLink("Hi Chatua, I have a question.");
  const email = supportEmail();
  return (
    <main id="main" className="app-main">
      <BackBar title="Account" back={false} />
      <div className="mx-4 mb-3 mt-3.5 flex items-center gap-3.5 rounded-card bg-card p-3.5 shadow-soft">
        <span className="grid size-[52px] flex-none place-items-center rounded-full bg-clay-soft text-clay">
          <UserIcon />
        </span>
        <div>
          <b>Welcome to Chatua</b>
          <p className="mt-0.5 text-[13px] text-muted">Sign in to track orders and save addresses. Coming soon.</p>
        </div>
      </div>
      <nav aria-label="Account" className="mx-4 my-2 flex flex-col gap-2.5">
        {MENU.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-paper p-[15px] text-[14.5px] font-medium">
            <Icon />
            {label}
            <RightIcon className="ml-auto text-muted" />
          </Link>
        ))}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-paper p-[15px] text-[14.5px] font-medium">
            <ChatIcon />
            Chat with us on WhatsApp
            <RightIcon className="ml-auto text-muted" />
          </a>
        )}
      </nav>
      <p className="mx-4 mt-4 text-center text-xs text-muted">
        Follow us on{" "}
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-clay underline-offset-2 hover:underline">
          Instagram @chatua.in
        </a>
        {email && (
          <>
            {" "}· <a href={`mailto:${email}`} className="font-semibold text-clay">{email}</a>
          </>
        )}
      </p>
      <SiteCredit />
    </main>
  );
}
