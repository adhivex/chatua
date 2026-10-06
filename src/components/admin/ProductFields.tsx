import { inputCls, labelCls } from "./ActionForm";

type P = { name?: string; category?: string; shortDesc?: string; longDesc?: string; howToEnjoy?: string | null; storage?: string | null; sortOrder?: number; active?: boolean; bestseller?: boolean };

export function ProductFields({ p = {}, categories }: { p?: P; categories: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={labelCls} htmlFor="name">Name</label>
        <input id="name" name="name" required maxLength={80} defaultValue={p.name} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="category">Category (shop filter chip)</label>
        <input id="category" name="category" required maxLength={40} list="categories" defaultValue={p.category} className={inputCls} />
        <datalist id="categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="shortDesc">Short description (cards and search)</label>
        <input id="shortDesc" name="shortDesc" required maxLength={160} defaultValue={p.shortDesc} className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls} htmlFor="longDesc">Product details</label>
        <textarea id="longDesc" name="longDesc" required maxLength={2000} rows={4} defaultValue={p.longDesc} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="howToEnjoy">How to enjoy</label>
        <textarea id="howToEnjoy" name="howToEnjoy" maxLength={2000} rows={3} defaultValue={p.howToEnjoy ?? ""} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="storage">Storage</label>
        <textarea id="storage" name="storage" maxLength={1000} rows={3} defaultValue={p.storage ?? ""} className={inputCls} />
      </div>
      <div>
        <label className={labelCls} htmlFor="sortOrder">Display order (lower shows first)</label>
        <input id="sortOrder" name="sortOrder" type="number" min={0} max={9999} defaultValue={p.sortOrder ?? 10} className={inputCls} />
      </div>
      <div className="flex items-end gap-5 pb-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={p.active ?? true} className="size-4 accent-[var(--clay)]" /> Show in shop
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="bestseller" defaultChecked={p.bestseller ?? false} className="size-4 accent-[var(--clay)]" /> Bestseller tag
        </label>
      </div>
    </div>
  );
}
