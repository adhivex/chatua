import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Confetti, CopyOrderId, PaymentPoller, TrackOrder } from "@/components/shop/OrderClient";
import { ProductCard } from "@/components/shop/ProductCard";
import { CheckIcon, ChatIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { deliveryWindow, formatDateTime } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { displayOrderNumber, ORDER_NUMBER_RE } from "@/lib/order-number";
import { whatsappLink } from "@/lib/site";
import { getOrderForCustomer } from "@/server/orders";
import { getProducts } from "@/server/products";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

const STEP_AT = { PLACED: 1, PACKED: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: 0 } as const;

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[orderNumber]">) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : undefined;
  if (!ORDER_NUMBER_RE.test(orderNumber)) notFound();
  const order = await getOrderForCustomer(orderNumber, token);
  if (!order) notFound();

  const placed = sp.placed === "1";
  const id = displayOrderNumber(order.orderNumber);
  const cancelled = order.status === "CANCELLED";
  const awaitingPayment = !cancelled && order.paymentMethod !== "COD" && order.paymentStatus !== "PAID";
  const window_ = deliveryWindow(order.createdAt, order.deliveryMethod);
  const at = STEP_AT[order.status];
  const steps = [
    { title: "Order confirmed", sub: formatDateTime(order.createdAt), done: at >= 1 },
    { title: "Packed fresh in Odisha", sub: at >= 2 ? "Packed" : "Within 24 hours", done: at >= 2 },
    { title: "Out for delivery", sub: at >= 3 ? "On its way" : `Expected ${window_}`, done: at >= 3 },
    { title: "Delivered", sub: at >= 4 ? "Enjoy your Chatua!" : "", done: at >= 4 },
  ];
  const inOrder = new Set(order.items.map((i) => i.productId));
  const suggestions = (await getProducts()).filter((p) => !inOrder.has(p.id)).slice(0, 2);
  const help = whatsappLink(`Hi Chatua, I need help with my order ${id}.`);

  const heading = cancelled ? "Order Cancelled" : awaitingPayment ? "Confirming Your Payment" : placed ? "Order Placed\nSuccessfully!" : "Thank You for\nYour Order!";
  const sub = cancelled
    ? "This order was cancelled. If you paid online, the refund goes back to your original payment method."
    : awaitingPayment
      ? "This can take a few seconds. Please keep this page open."
      : "Thank you for choosing Chatua.\nYour order has been confirmed.";

  return (
    <main id="main" className="app-main">
      <section className="relative overflow-hidden px-4 pb-6 pt-[18px] text-center">
        {placed && !cancelled && !awaitingPayment && <Confetti />}
        <div
          className={cn(
            "animate-pop mx-auto mb-3.5 mt-[26px] grid size-[76px] place-items-center rounded-full text-white",
            cancelled ? "bg-muted" : "bg-[image:var(--grad-success)] shadow-[0_0_0_9px_#e8f1e6,0_0_0_10px_var(--gold)]",
          )}
        >
          {cancelled ? <span className="text-3xl font-bold">!</span> : <CheckIcon />}
        </div>
        <h1 className="whitespace-pre-line font-head text-[32px] font-semibold leading-[1.05] tracking-[-.8px]">{heading}</h1>
        <p className="mt-2 whitespace-pre-line text-sm leading-[1.4] text-muted">{sub}</p>
        {awaitingPayment && <PaymentPoller orderNumber={order.orderNumber} token={order.accessToken} />}

        <div className="mb-3.5 mt-5 rounded-card bg-card p-3.5 text-left shadow-soft">
          <div className="flex items-center justify-between py-1.5">
            <div>
              <small className="block text-[12.5px] text-muted">Order ID</small>
              <b className="text-[15px]">{id}</b>
            </div>
            <CopyOrderId id={id} />
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-line pb-1.5 pt-3">
            <div>
              <small className="block text-[12.5px] text-muted">{cancelled ? "Status" : "Estimated Delivery"}</small>
              <b className="text-[15px]">{cancelled ? "Cancelled" : window_}</b>
            </div>
            <b className="font-head text-lg font-semibold">{formatINR(order.total)}</b>
          </div>
          <details className="mt-1.5 border-t border-line pt-2.5 text-[13.5px]">
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold">Order details</summary>
            <ul className="mt-1 space-y-1 text-muted">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between">
                  <span>
                    {it.name} · {it.size} × {it.qty}
                  </span>
                  <span className="text-ink">{formatINR(it.unitPrice * it.qty)}</span>
                </li>
              ))}
              <li className="flex justify-between">
                <span>Delivery ({order.deliveryMethod === "EXPRESS" ? "Express" : "Standard"})</span>
                <span className="text-ink">{order.deliveryFee ? formatINR(order.deliveryFee) : "Free"}</span>
              </li>
              <li className="flex justify-between">
                <span>Payment</span>
                <span className="text-ink">{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentStatus === "PAID" ? "Paid online" : order.paymentStatus === "REFUNDED" ? "Refunded" : "Not paid"}</span>
              </li>
              <li className="pt-1">
                Delivering to {order.customerName}, {order.addressLine}, {order.city} {order.pincode}
              </li>
            </ul>
          </details>
        </div>
        {!cancelled && <TrackOrder steps={steps} open={!placed} />}
        {help && (
          <a href={help} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-clay">
            <ChatIcon size={18} /> Need help? Chat with us on WhatsApp
          </a>
        )}
        <p className="mt-2 text-xs text-muted">Bookmark this page to check your order status later.</p>
      </section>

      {suggestions.length > 0 && (
        <>
          <h2 className="mx-4 mb-3 mt-1.5 font-head text-[21px] font-semibold tracking-[-.3px]">You might also like</h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-5">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} className="flex-[0_0_46%]" />
            ))}
          </div>
        </>
      )}
      {cancelled && (
        <div className="px-4 pb-6">
          <Link href="/shop" className="btn btn-primary btn-block">
            Shop Chatua
          </Link>
        </div>
      )}
    </main>
  );
}
