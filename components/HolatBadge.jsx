const holatConfig = {
  XAVFSIZ: {
    label: "XAVFSIZ",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  MUDDATI_OTGAN: {
    label: "MUDDATI O'TGAN",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  TEKSHIRUVDA: {
    label: "TEKSHIRUVDA",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  TAMIRLAB: {
    label: "TA'MIRLAB",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
};

export default function HolatBadge({ holat }) {
  const { label, className } = holatConfig[holat] ?? holatConfig.XAVFSIZ;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full font-mono text-[0.6rem] font-semibold tracking-widest whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}
