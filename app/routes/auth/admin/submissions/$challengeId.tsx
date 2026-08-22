import { useState, useMemo } from "react";
import { Link, useParams } from "react-router";
import { useGetChallengeSubmissions } from "@/hooks/submission";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import GradingModal from "@/features/auth/submissions/grading-modal";
import ErrorState from "@/components/custom/error-state";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "submitted":
      return "default";
    case "graded":
      return "secondary";
    case "returned":
      return "outline";
    case "not_submitted":
      return "ghost";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "graded":
      return "Graded";
    case "returned":
      return "Returned";
    case "not_submitted":
      return "Not Submitted";
    default:
      return status;
  }
}

export default function SubmissionReviewPage() {
  const { challengeId: challengeIdParam } = useParams();
  const challengeId = Number(challengeIdParam);
  const { data, isLoading, error, refetch } =
    useGetChallengeSubmissions(challengeId);

  // State for filters and search
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    number | null
  >(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];

    let filtered = data.students;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Search by student name or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.profile.display_name?.toLowerCase().includes(query) ||
          student.profile.email.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [data?.students, statusFilter, searchQuery]);

  // Get latest submission for a student
  const getLatestSubmission = (student: {
    attempts?: Array<{
      id: number;
      attempt_number: number;
      status: string;
      score: number | null;
      submitted_at: string | null;
    }> | null;
  }) => {
    if (!student.attempts || student.attempts.length === 0) return null;
    return student.attempts.reduce((latest, current) =>
      current.attempt_number > latest.attempt_number ? current : latest,
    );
  };

  const handleGradeSubmission = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setIsGradingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/admin/challenges">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>
        <ErrorState
          title="Unable to load submissions"
          message={
            error.message || "An error occurred while loading submissions."
          }
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Link to="/admin/challenges">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>
        <ErrorState
          title="Challenge not found"
          message="The requested challenge could not be found."
        />
      </div>
    );
  }

  const { challenge, students } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/admin/challenges">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back to challenges">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
              <p className="text-muted-foreground text-sm">
                Challenge:{" "}
                <span className="font-medium">{challenge.title}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                Max Score: {challenge.max_score} • Allowed Attempts:{" "}
                {challenge.allowed_attempts}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {students.length} {students.length === 1 ? "Student" : "Students"}
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_submitted">Not Submitted</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      {(statusFilter !== "all" || searchQuery.trim()) && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      )}

      {/* Submissions Table */}
      {filteredStudents.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-1">No submissions found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery.trim() || statusFilter !== "all" ?
              "Try adjusting your filters"
            : "No students have submitted yet"}
          </p>
        </div>
      : <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Last Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const latestSubmission = getLatestSubmission(student);
                return (
                  <TableRow key={student.profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage
                            src={student.profile.avatar || undefined}
                            alt={student.profile.display_name || ""}
                          />
                          <AvatarFallback>
                            {student.profile.display_name
                              ?.charAt(0)
                              .toUpperCase() ||
                              student.profile.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {student.profile.display_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.profile.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {student.submission_count}/{challenge.allowed_attempts}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(student.status)}>
                        {getStatusLabel(student.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(
                        latestSubmission?.score !== null &&
                        latestSubmission?.score !== undefined
                      ) ?
                        <span className="font-medium">
                          {latestSubmission.score}/{challenge.max_score}
                        </span>
                      : <span className="text-muted-foreground text-sm">-</span>
                      }
                    </TableCell>
                    <TableCell>
                      {latestSubmission?.submitted_at ?
                        <span className="text-sm">
                          {format(
                            new Date(latestSubmission.submitted_at),
                            "MMM d, yyyy",
                          )}
                        </span>
                      : <span className="text-muted-foreground text-sm">-</span>
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      {latestSubmission ?
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleGradeSubmission(latestSubmission.id)
                          }>
                          {latestSubmission.score !== null ? "Review" : "Grade"}
                        </Button>
                      : <Button size="sm" variant="ghost" disabled>
                          No Submission
                        </Button>
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      }

      {/* Grading Modal */}
      <GradingModal
        submissionId={selectedSubmissionId}
        isOpen={isGradingModalOpen}
        onOpenChange={setIsGradingModalOpen}
      />
    </div>
  );
}
