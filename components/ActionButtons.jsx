// Ko'rish ikonkasi
function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

// Tahrirlash ikonkasi
function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

// Menyu ikonkasi
function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

export default function ActionButtons({ qurilmaId, onView, onEdit, onMenu }) {
  return (
    <div className="flex items-center justify-end gap-3 text-slate-500">
      <button
        onClick={() => onView?.(qurilmaId)}
        className="hover:text-blue-400 hover:scale-110 transition-all duration-150"
        title="Ko'rish"
      >
        <EyeIcon />
      </button>
      <button
        onClick={() => onEdit?.(qurilmaId)}
        className="hover:text-blue-400 hover:scale-110 transition-all duration-150"
        title="Tahrirlash"
      >
        <EditIcon />
      </button>
      <button
        onClick={() => onMenu?.(qurilmaId)}
        className="hover:text-blue-400 hover:scale-110 transition-all duration-150"
        title="Menyu"
      >
        <MenuIcon />
      </button>
    </div>
  );
}
