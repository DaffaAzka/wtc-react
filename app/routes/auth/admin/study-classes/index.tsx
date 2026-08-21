import Header from "@/features/auth/study-classes/header";
import StudyClassesTable from "@/features/auth/study-classes/table";
import { useGetStudyClasses } from "@/hooks/study-classes";

export default function IndexPage() {
  const { studyClasses, loading, error, refresh } = useGetStudyClasses();

  return (
    <>
      <Header count={studyClasses.length} />
      <StudyClassesTable
        data={studyClasses}
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    </>
  );
}
