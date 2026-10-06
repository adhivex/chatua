"use client";

import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { SearchIcon } from "@/components/ui/icons";

type Entry = { id: string; category: string; text: string };

/**
 * Live search (name + description) and category chips over server-rendered rows.
 * Rows stay server components; this only decides which ones are visible.
 */
export function ShopFilters({ categories, index, children }: { categories: string[]; index: Entry[]; children: React.ReactNode }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [ready, setReady] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Read ?q, ?category and ?focus after mount so the page itself stays static.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL */
    setQ(p.get("q") ?? "");
    const c = p.get("category");
    if (c && categories.includes(c)) setCat(c);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (p.get("focus")) input.current?.focus();
  }, [categories]);

  // Keep the URL shareable without adding history entries.
  useEffect(() => {
    if (!ready) return;
    const u = new URL(window.location.href);
    u.searchParams.delete("focus");
    if (q.trim()) u.searchParams.set("q", q.trim());
    else u.searchParams.delete("q");
    if (cat !== "All") u.searchParams.set("category", cat);
    else u.searchParams.delete("category");
    window.history.replaceState(window.history.state, "", u);
  }, [q, cat, ready]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return new Set(index.filter((e) => (cat === "All" || e.category === cat) && (!needle || e.text.includes(needle))).map((e) => e.id));
  }, [q, cat, index]);

  const rows = Children.toArray(children).filter((c) => isValidElement<{ "data-product": string }>(c) && visible.has(c.props["data-product"]));

  return (
    <>
      <div className="mx-4 mb-3 mt-3.5 flex h-12 items-center gap-2.5 rounded-[15px] bg-card px-3.5 text-muted shadow-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-clay">
        <SearchIcon />
        <label htmlFor="shop-search" className="sr-only">
          Search Chatua
        </label>
        <input
          id="shop-search"
          ref={input}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Chatua…"
          autoComplete="off"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>
      <ChipRow label="Category">
        {categories.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </ChipRow>
      <p className="sr-only" aria-live="polite">
        {rows.length} {rows.length === 1 ? "product" : "products"} shown
      </p>
      {rows.length ? (
        <div className="flex flex-col gap-3 px-4 pb-4">{rows}</div>
      ) : (
        <div className="px-6 py-[50px] text-center text-muted">
          <SearchIcon size={28} className="mx-auto" />
          <h2 className="mb-1.5 mt-3.5 font-head text-xl font-semibold text-ink">No Chatua found</h2>
          <p>Try a different name, or see all our blends.</p>
          <button
            type="button"
            className="btn btn-primary mt-[18px] px-[18px] py-[11px] text-[13.5px]"
            onClick={() => {
              setQ("");
              setCat("All");
            }}
          >
            Show all Chatua
          </button>
        </div>
      )}
    </>
  );
}
