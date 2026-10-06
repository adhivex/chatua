import { redirect } from "next/navigation";
import { ActionForm, inputCls, labelCls, Submit } from "@/components/admin/ActionForm";
import { Logo } from "@/components/layout/Logo";
import { getAdmin } from "@/lib/session";
import { login } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-card bg-card p-6 shadow-lift">
        <Logo />
        <h1 className="mt-5 font-head text-2xl font-semibold">Shop admin</h1>
        <ActionForm action={login} className="mt-4 space-y-3">
          <div>
            <label htmlFor="email" className={labelCls}>
              Email
            </label>
            <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className={labelCls}>
              Password
            </label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
          </div>
          <Submit className="w-full">Sign in</Submit>
        </ActionForm>
      </div>
    </main>
  );
}
