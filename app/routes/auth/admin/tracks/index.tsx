import { useState, useEffect } from "react";
import TracksTable from "@/features/auth/tracks/table";
import { useGetTracksPaginated } from "@/hooks/tracks";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router";
import { Plus } from "lucide-react";
import ModalAdd from "@/features/auth/tracks/modal-add";
import { BookOpen } from "lucide-react";

export default function IndexPage() {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith("/teacher") ? "/teacher" : "";
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [mounted, setMounted] = useState(false);

  const { tracks, pagination, loading, error, refresh } = useGetTracksPaginated({
    page,
    per_page: perPage,
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Content
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Tracks
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Browse and manage all learning tracks in your curriculum.
          </p>
        </div>
        <div className="shrink-0 mt-1">
          <ModalAdd />
        </div>
      </div>

      <TracksTable
        data={tracks}
        loading={loading}
        error={error}
        onRetry={refresh}
        total={pagination?.total}
        basePath={basePath}
      />

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
