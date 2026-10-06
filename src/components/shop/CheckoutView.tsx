"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { cn } from "@/lib/cn";
import { DELIVERY, deliveryFee, type DeliveryMethod } from "@/lib/delivery";
import { formatINR } from "@/lib/money";
import { loadRazorpay, type RazorpaySuccess } from "@/lib/razorpay-client";
import { addressSchema, type Address, type AddressInput, type PaymentMethodValue } from "@/lib/validators";
import { useCart } from "@/store/cart";
import { ArrowIcon, BankIcon, CardIcon, CashIcon, HomeIcon, UpiIcon, WorkIcon } from "@/components/ui/icons";
import { RadioCard } from "@/components/ui/RadioCard";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { StickyCta } from "@/components/ui/StickyCta";
import { type CatalogItem, useCartLines } from "./CartView";
import { MockPaymentSheet } from "./MockPaymentSheet";
import { OrderSummary } from "./OrderSummary";

type Provider = "razorpay" | "mock" | "none";
type RazorpayPayment = { provider: "razorpay"; keyId: string; orderId: string; amount: number; currency: string; method?: string; prefill: Record<string, string> };
type Placed = { orderNumber: string; token: string; total: number; payment?: { provider: "mock"; amount: number } | RazorpayPayment };

const SUMMARY_ERROR = "Please complete the highlighted fields. Mobile needs 10 digits and pincode needs 6 digits.";

const PAYMENTS: { value: PaymentMethodValue; title: string; Icon: typeof UpiIcon; online: boolean }[] = [
  { value: "UPI", title: "UPI (Google Pay, PhonePe, etc.)", Icon: UpiIcon, online: true },
  { value: "CARD", title: "Credit / Debit Card", Icon: CardIcon, online: true },
  { value: "NETBANKING", title: "Net Banking", Icon: BankIcon, online: true },
  { value: "COD", title: "Cash on Delivery (COD)", Icon: CashIcon, online: false },
];

export function CheckoutView({ catalog, provider }: { catalog: CatalogItem[]; provider: Provider }) {
  const router = useRouter();
  const { hydrated, rows, subtotal } = useCartLines(catalog);
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);
  const online = provider !== "none";

  const [delivery, setDelivery] = useState<DeliveryMethod>("STANDARD");
  const [payment, setPayment] = useState<PaymentMethodValue>(online ? "UPI" : "COD");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mock, setMock] = useState<Placed | null>(null);

  const form = useForm<AddressInput, unknown, Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: { addressType: "Home", name: "", phone: "", line: "", city: "", pincode: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { register, handleSubmit, setValue, formState, control } = form;
  const errors = formState.errors;
  const addressType = useWatch({ control, name: "addressType" });

  const fee = deliveryFee(subtotal, delivery);
  const total = subtotal + fee;

  if (!hydrated) return <ListSkeleton rows={3} className="pt-4" />;
  if (!rows.length && !busy) {
    return (
      <div className="px-6 py-[50px] text-center text-muted">
        <h2 className="mb-1.5 font-head text-xl font-semibold text-ink">Your cart is empty</h2>
        <p>Add a pack of Chatua before checking out.</p>
        <Link href="/shop" className="btn btn-primary mt-[18px]">
          Shop Chatua
        </Link>
      </div>
    );
  }

  const showError = (msg: string) => {
    setError(msg);
    requestAnimationFrame(() => document.getElementById("checkout-top")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const finish = (orderNumber: string, token: string) => {
    clearCart();
    router.replace(`/order/${orderNumber}?t=${encodeURIComponent(token)}&placed=1`);
  };

  const abandon = async (o: Placed, message: string) => {
    const res = await fetch("/api/payments/abandon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: o.orderNumber, token: o.token }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { status?: string } | null;
    if (data?.status === "paid") return finish(o.orderNumber, o.token);
    setBusy(false);
    showError(message);
  };

  const payWithRazorpay = async (o: Placed, p: RazorpayPayment) => {
    let Razorpay;
    try {
      Razorpay = await loadRazorpay();
    } catch {
      return abandon(o, "We could not open the payment page. Check your connection and try again, or choose Cash on Delivery.");
    }
    let settled = false;
    const rzp = new Razorpay({
      key: p.keyId,
      order_id: p.orderId,
      amount: p.amount,
      currency: p.currency,
      name: "Chatua",
      description: `Order #${o.orderNumber}`,
      prefill: { ...p.prefill, method: p.method },
      notes: { orderNumber: o.orderNumber },
      theme: { color: "#b4421a" },
      retry: { enabled: true, max_count: 3 },
      handler: async (resp: RazorpaySuccess) => {
        settled = true;
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber: o.orderNumber, token: o.token, ...resp }),
        }).catch(() => null);
        if (res?.ok) return finish(o.orderNumber, o.token);
        // Signature check failed or network error: the webhook may still confirm it; let the server decide.
        await abandon(o, "We could not confirm your payment. If money was deducted it will be refunded. Your cart is saved, so you can try again.");
      },
      modal: {
        confirm_close: true,
        ondismiss: () => {
          if (!settled) void abandon(o, "Payment was not completed. Your cart is saved, so you can try again.");
        },
      },
    });
    rzp.open();
  };

  const onSubmit = handleSubmit(
    async (address) => {
      setError(null);
      setBusy(true);
      let res: Response | null = null;
      try {
        res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: lines, address, deliveryMethod: delivery, paymentMethod: payment, expectedTotal: total }),
        });
      } catch {
        setBusy(false);
        return showError("We could not reach the shop. Check your connection and try again.");
      }
      const data = (await res.json().catch(() => ({}))) as Partial<Placed> & { message?: string; code?: string };
      if (!res.ok || !data.orderNumber || !data.token) {
        setBusy(false);
        if (data.code === "PRICE_CHANGED" || data.code === "OUT_OF_STOCK" || data.code === "UNAVAILABLE") router.refresh();
        return showError(data.message ?? "We could not place your order. Please try again.");
      }
      const placed = data as Placed;
      if (!placed.payment) return finish(placed.orderNumber, placed.token);
      if (placed.payment.provider === "mock") return setMock(placed);
      return payWithRazorpay(placed, placed.payment);
    },
    () => showError(SUMMARY_ERROR),
  );

  const field = (name: keyof Omit<AddressInput, "addressType">, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => {
    const err = errors[name]?.message;
    return (
      <div>
        <label htmlFor={`f-${name}`} className="sr-only">
          {label}
        </label>
        <input
          id={`f-${name}`}
          placeholder={label}
          aria-invalid={!!err}
          aria-describedby={err ? `e-${name}` : undefined}
          className={cn(
            "min-h-11 w-full rounded-input border bg-field p-3 text-sm placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-clay",
            err ? "border-danger" : "border-line",
          )}
          {...props}
          {...register(name)}
        />
        {err && (
          <p id={`e-${name}`} className="mt-1 text-[12.5px] text-danger">
            {err}
          </p>
        )}
      </div>
    );
  };

  const payNote = payment === "COD" ? "Pay in cash when your order arrives" : provider === "mock" ? "Test mode: no real payment is taken" : "100% Secure Payment";

  return (
    <form onSubmit={onSubmit} noValidate>
      <div id="checkout-top" className="scroll-mt-20 pt-3.5" />
      {provider === "mock" && (
        <p className="mx-4 mb-3 rounded-xl border border-gold bg-gold-wash px-3 py-2 text-[12.5px] text-clay-dark">Test mode: online payments are simulated. No money is taken.</p>
      )}
      <div role="radiogroup" aria-label="Address type" className="mx-4 mb-3 flex gap-2.5">
        {(["Home", "Work"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={addressType === t}
            onClick={() => setValue("addressType", t)}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[14px] border p-3 text-sm font-medium",
              addressType === t ? "border-espresso bg-espresso font-bold text-gold-light" : "border-line bg-card text-muted",
            )}
          >
            {t === "Home" ? <HomeIcon size={18} /> : <WorkIcon />}
            {t}
          </button>
        ))}
      </div>

      <fieldset className="mx-4 flex flex-col gap-2.5 rounded-card bg-card p-3.5 shadow-soft">
        <legend className="sr-only">Delivery address</legend>
        {field("name", "Full name", { autoComplete: "name" })}
        {field("phone", "Mobile number", { type: "tel", inputMode: "numeric", autoComplete: "tel-national", maxLength: 14 })}
        {field("line", "House no., street, area", { autoComplete: "street-address" })}
        <div className="grid grid-cols-2 gap-2.5">
          {field("city", "City", { autoComplete: "address-level2" })}
          {field("pincode", "Pincode", { inputMode: "numeric", autoComplete: "postal-code", maxLength: 6 })}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="mx-4 mt-2 text-[12.5px] text-danger">
          {error}
        </p>
      )}

      <h2 className="mx-4 mb-3 mt-5 font-head text-[21px] font-semibold tracking-[-.3px]">Delivery Options</h2>
      <div className="mx-4" role="radiogroup" aria-label="Delivery options">
        {(["STANDARD", "EXPRESS"] as const).map((m) => {
          const f = deliveryFee(subtotal, m);
          return (
            <RadioCard
              key={m}
              name="delivery"
              value={m}
              checked={delivery === m}
              onChange={() => setDelivery(m)}
              title={DELIVERY[m].label}
              detail={DELIVERY[m].eta}
              aside={<span className={cn("text-sm font-bold", f === 0 && "text-leaf")}>{f === 0 ? "Free" : formatINR(f)}</span>}
            />
          );
        })}
      </div>

      <h2 className="mx-4 mb-3 mt-5 font-head text-[21px] font-semibold tracking-[-.3px]">Payment Method</h2>
      <div className="mx-4" role="radiogroup" aria-label="Payment method">
        {PAYMENTS.map(({ value, title, Icon, online: needsOnline }) => (
          <RadioCard
            key={value}
            name="payment"
            value={value}
            checked={payment === value}
            onChange={() => setPayment(value)}
            title={title}
            detail={needsOnline && !online ? "Coming soon. Choose Cash on Delivery for now." : undefined}
            disabled={needsOnline && !online}
            icon={<Icon />}
            dotPosition="end"
          />
        ))}
      </div>

      <div className="mt-1.5">
        <OrderSummary itemsLabel="Items" subtotal={subtotal} delivery={fee} total={total} />
      </div>
      <div className="h-4" />

      <StickyCta note={payNote}>
        <button type="submit" className="btn btn-primary btn-block" disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <span className="spinner" aria-hidden="true" /> Placing your order…
            </>
          ) : (
            <>
              Pay {formatINR(total)} <ArrowIcon />
            </>
          )}
        </button>
      </StickyCta>

      {mock && (
        <MockPaymentSheet
          amount={mock.total}
          method={PAYMENTS.find((p) => p.value === payment)?.title ?? "Online"}
          onResult={async (outcome) => {
            const o = mock;
            setMock(null);
            const res = await fetch("/api/payments/mock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderNumber: o.orderNumber, token: o.token, outcome }),
            }).catch(() => null);
            const data = (await res?.json().catch(() => null)) as { status?: string } | null;
            if (data?.status === "paid") return finish(o.orderNumber, o.token);
            setBusy(false);
            showError(outcome === "failure" ? "Payment failed. Your cart is saved, so you can try again." : "Payment was not completed. Your cart is saved, so you can try again.");
          }}
        />
      )}
    </form>
  );
}
