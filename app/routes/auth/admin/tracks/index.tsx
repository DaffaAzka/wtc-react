import Header from "@/features/auth/tracks/header";
import TracksTable from "@/features/auth/tracks/table";
import { useGetTracks } from "@/hooks/tracks";

export default function IndexPage() {
  const { tracks, loading, error, refresh } = useGetTracks();

  return (
    <>
      <Header count={tracks.length} />
      <TracksTable
        data={tracks}
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    </>
  );
}