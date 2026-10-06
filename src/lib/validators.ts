import { z } from "zod";

export const MAX_QTY = 20;
export const MAX_LINES = 30;

export const SIZES = ["500g", "1kg"] as const;
export type Size = (typeof SIZES)[number];

export const PAYMENT_METHODS = ["UPI", "CARD", "NETBANKING", "COD"] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];
export const DELIVERY_METHODS = ["STANDARD", "EXPRESS"] as const;

const trimmed = (max: number) => z.string().trim().max(max);

/** Delivery details form. Messages match the prototype's inline errors. */
export const addressSchema = z.object({
  addressType: z.enum(["Home", "Work"]),
  name: trimmed(80).min(1, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|0)(?=\d{10}$)/, ""))
    .pipe(z.string().regex(/^\d{10}$/, "Mobile needs 10 digits")),
  line: trimmed(200).min(1, "Enter your house no., street and area"),
  city: trimmed(60).min(1, "Enter your city"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode needs 6 digits"),
});
export type AddressInput = z.input<typeof addressSchema>;
export type Address = z.output<typeof addressSchema>;

export const cartLineSchema = z.object({
  productId: z.string().min(1).max(40),
  size: z.enum(SIZES),
  qty: z.number().int().min(1).max(MAX_QTY),
});
export type CartLineInput = z.infer<typeof cartLineSchema>;

export const checkoutSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty").max(MAX_LINES),
  address: addressSchema,
  deliveryMethod: z.enum(DELIVERY_METHODS),
  paymentMethod: z.enum(PAYMENT_METHODS),
  /** What the customer saw; if the server total differs we ask them to review instead of charging. */
  expectedTotal: z.number().int().nonnegative().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const orderAccessSchema = z.object({
  orderNumber: z.string().regex(/^CHATUA\d{5,}$/),
  token: z.string().min(20).max(100),
});
