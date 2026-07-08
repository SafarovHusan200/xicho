const BadgeCell = ({ value, trueColor = '#10B981', falseColor = '#94a3b8' }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
    style={
      value
        ? { backgroundColor: `${trueColor}18`, color: trueColor, borderColor: `${trueColor}30` }
        : { backgroundColor: `${falseColor}12`, color: falseColor, borderColor: `${falseColor}25` }
    }
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: value ? trueColor : falseColor }}
    />
    {value ? 'Ha' : "Yo'q"}
  </span>
);

export default BadgeCell;
