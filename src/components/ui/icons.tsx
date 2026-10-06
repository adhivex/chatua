// Icons drawn for the prototype (docs/reference/chatua-prototype-v3.html), as React components.
import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "stroke"> & { size?: number; stroke?: number };

function make(paths: React.ReactNode, defSize = 22, defStroke = 1.8) {
  function Icon({ size = defSize, stroke = defStroke, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {paths}
      </svg>
    );
  }
  return Icon;
}

export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const CartIcon = make(<><path d="M3 4h2.5l2.2 11h10.6l2-8H6.4" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></>);
export const BackIcon = make(<path d="M15 5l-7 7 7 7" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />, 18, 2.4);
export const MinusIcon = make(<path d="M5 12h14" />, 18, 2.4);
export const HomeIcon = make(<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />);
export const ShopIcon = make(<><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>);
export const BookIcon = make(<><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16M9 5v5" /></>);
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>);
export const HeartIcon = make(<path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />, 20);
export const ShareIcon = make(<><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="m8 11 8-4M8 13l8 4" /></>, 20);
export const TrashIcon = make(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />, 19);
export const ArrowIcon = make(<path d="M5 12h14M13 6l6 6-6 6" />, 17, 2.2);
export const ChevronIcon = make(<path d="m6 9 6 6 6-6" />, 20);
export const RightIcon = make(<path d="m9 6 6 6-6 6" />, 18);
export const LeafIcon = make(<><path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14z" /><path d="M5 19 13 11" /></>, 20);
export const NutritionIcon = make(<><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" /><path d="M8 12h2l1-2 2 4 1-2h2" /></>, 20, 1.5);
export const NoPreservativesIcon = make(<><path d="M8 6c4-1 8 1 8 5s-3 7-7 7" /><path d="M4 4l16 16" /></>, 20);
export const TruckIcon = make(<><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>, 20, 1.6);
export const LockIcon = make(<><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>, 20, 1.6);
export const ReturnIcon = make(<path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" />, 20, 1.6);
export const WorkIcon = make(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2" /></>, 18);
export const CardIcon = make(<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>, 22, 1.6);
export const BankIcon = make(<path d="M3 10 12 4l9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" />, 22, 1.6);
export const CashIcon = make(<><rect x="3" y="7" width="18" height="10" rx="2" /><circle cx="12" cy="12" r="2.5" /></>, 22, 1.6);
export const UpiIcon = make(<path d="M7 4l5 8-5 8M13 4l5 8-5 8" />, 22, 1.6);
export const CheckIcon = make(<path d="m5 12 5 5 9-10" />, 36, 3);
export const CopyIcon = make(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>, 19);
export const InfoIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>);
export const TempleIcon = make(<path d="M12 3c3 3 3 6 3 8h3v10H6V11h3c0-2 0-5 3-8z" />, 22, 1.6);
export const ChatIcon = make(<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.4z" />, 22, 1.6);
export const DocIcon = make(<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>, 22, 1.6);
