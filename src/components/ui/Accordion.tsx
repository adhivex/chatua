import { ChevronIcon } from "./icons";

export function Accordion({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="mt-[18px] border-t border-[rgba(200,160,90,.35)] pt-3.5">
      <summary className="flex min-h-11 cursor-pointer items-center justify-between font-head text-[17px] font-semibold">
        {title}
        <ChevronIcon className="chev transition-transform" />
      </summary>
      <div className="mt-1 max-w-[62ch] text-[13.5px] leading-[1.55] text-muted">{children}</div>
    </details>
  );
}
