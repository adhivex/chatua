"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import type { FormState } from "@/app/admin/actions";

type Action = (state: FormState, form: FormData) => Promise<FormState>;

/** Form bound to a server action, with an inline success/error message. */
export function ActionForm({ action, children, className, encType }: { action: Action; children: React.ReactNode; className?: string; encType?: string }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className} encType={encType}>
      {children}
      {state?.error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="mt-2 text-sm font-semibold text-leaf">
          {state.ok}
        </p>
      )}
    </form>
  );
}

export function Submit({ children, variant = "primary", className }: { children: React.ReactNode; variant?: "primary" | "line" | "danger"; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "btn min-h-10 px-4 py-2 text-sm",
        variant === "primary" && "btn-primary",
        variant === "line" && "btn-line",
        variant === "danger" && "border border-danger bg-transparent text-danger",
        className,
      )}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

export const inputCls = "min-h-10 w-full rounded-input border border-line bg-field px-3 py-2 text-sm focus:outline-2 focus:outline-offset-1 focus:outline-clay";
export const labelCls = "mb-1 block text-xs font-semibold text-muted";
