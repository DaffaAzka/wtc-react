import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useAllMySubmissions, useGetSubmissionFile } from "@/hooks/submission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { SubmissionDetail } from "@/types/submission";

export default function MySubmissions() {
  const { data: submissions, isLoading, error } = useAllMySubmissions();
  const downloadFile = useGetSubmissionFile();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const itemsPerPage = 10;

  // Filter and search submissions
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];

    let filtered = [...submissions];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Search by challenge name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sub) =>
        sub.challenge?.title?.toLowerCase().includes(query)
      );
    }

    // Sort by submitted_at descending
    filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

    return filtered;
  }, [submissions, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = useMemo(() => {
    if (!submissions) return { total: 0, submitted: 0, graded: 0, returned: 0 };

    return {
      total: submissions.length,
      submitted: submissions.filter((s) => s.status === "submitted").length,
      graded: submissions.filter((s) => s.status === "graded").length,
      returned: submissions.filter((s) => s.status === "returned").length,
    };
  }, [submissions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        );
      case "graded":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Graded
          </Badge>
        );
      case "returned":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Returned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = (submissionId: number) => {
    downloadFile.mutate(submissionId);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error.message || "Gagal memuat data submisi."}</p>
          <Button onClick={() => window.location.reload()} size="sm">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Submisi Saya</h1>
        <p className="text-muted-foreground">
          Riwayat pengiriman tugas dan tantangan yang telah Anda kerjakan
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{isLoading ? "-" : stats.total}</div>
            <p className="text-sm text-muted-foreground font-medium">Total Submisi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{isLoading ? "-" : stats.submitted}</div>
            <p className="text-sm text-muted-foreground font-medium">Menunggu Review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{isLoading ? "-" : stats.graded}</div>
            <p className="text-sm text-muted-foreground font-medium">Telah Dinilai</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{isLoading ? "-" : stats.returned}</div>
            <p className="text-sm text-muted-foreground font-medium">Dikembalikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama tantangan..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Submisi</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Tidak ada submisi yang sesuai dengan filter Anda."
                  : "Anda belum mengirimkan tantangan apapun."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tantangan</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="font-medium">{submission.challenge?.title || "Untitled"}</div>
                        {submission.feedback && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {submission.feedback}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(submission.submitted_at), "dd MMM yyyy", {
                            locale: localeId,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(submission.submitted_at), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission.status)}</TableCell>
                      <TableCell>
                        {submission.score !== null && submission.score !== undefined ? (
                          <span className="font-semibold">{submission.score}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {submission.file_path && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(submission.id)}
                              disabled={downloadFile.isPending}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} dari{" "}
                    {filteredSubmissions.length} submisi
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Submisi</DialogTitle>
            <DialogDescription>Informasi lengkap tentang submisi Anda</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tantangan</label>
                <p className="text-base font-semibold mt-1">
                  {selectedSubmission.challenge?.title || "Untitled"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nilai</label>
                  <p className="text-base font-semibold mt-1">
                    {selectedSubmission.score !== null && selectedSubmission.score !== undefined
                      ? selectedSubmission.score
                      : "-"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tanggal Submit</label>
                <p className="text-base mt-1">
                  {format(new Date(selectedSubmission.submitted_at), "dd MMMM yyyy 'pukul' HH:mm", {
                    locale: localeId,
                  })}
                </p>
              </div>
              {selectedSubmission.feedback && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Feedback</label>
                  <p className="text-base mt-1 whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                </div>
              )}
              {selectedSubmission.file_path && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">File</label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(selectedSubmission.id)}
                      disabled={downloadFile.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

