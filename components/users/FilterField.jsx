const FilterField = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="px-0.5 text-[12px] font-semibold text-[#7B8499] dark:text-slate-400">
      {label}
    </label>
    {children}
  </div>
);

export default FilterField;
