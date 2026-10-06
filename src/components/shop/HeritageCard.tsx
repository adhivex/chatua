import Link from "next/link";
import { TempleArt } from "./art";

export function HeritageCard() {
  return (
    <Link href="/heritage" className="relative mb-[26px] mt-1 block h-[136px] overflow-hidden rounded-[22px] text-left shadow-lift">
      <TempleArt className="absolute inset-0 h-full w-full" />
      <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,19,10,.94)_8%,rgba(34,19,10,.62)_50%,rgba(34,19,10,0)_88%)]" />
      <span className="absolute left-[18px] top-5 z-[2] block max-w-[60%]">
        <span className="block font-head text-xl font-semibold text-ivory">Chatua from Odisha</span>
        <span className="mb-2 mt-[3px] block text-xs leading-[1.35] text-ivory/75">A traditional food with a rich heritage.</span>
        <span className="text-[13px] font-semibold text-gold-light">Learn More →</span>
      </span>
    </Link>
  );
}
