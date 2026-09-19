import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationRow({
  page,
  lastPage,
  total,
  perPage,
  loading,
  onPrev,
  onNext,
}: {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (lastPage <= 1) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-gray-500 dark:text-gray-400">
        {from}–{to}{" "}
        <span className="text-gray-400 dark:text-gray-600">of</span> {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1 || loading}
          aria-label="Previous page"
          className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="tabular-nums text-[13px] font-bold text-gray-500 dark:text-gray-400 px-1">
          {page} / {lastPage}
        </span>
        <button
          onClick={onNext}
          disabled={page === lastPage || loading}
          aria-label="Next page"
          className="flex items-center gap-1 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
