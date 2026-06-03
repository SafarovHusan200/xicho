function ChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
  if (currentPage >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-[#1e2736] disabled:opacity-30 transition-colors"
      >
        <ChevronLeft />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-7 h-7 flex items-center justify-center text-xs text-slate-600 font-mono"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-mono transition-colors ${
              currentPage === page
                ? "bg-blue-600 text-white font-semibold"
                : "text-slate-400 hover:bg-[#1e2736]"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-[#1e2736] disabled:opacity-30 transition-colors"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
