import Header from "@/features/auth/tracks/header";
import TracksTable from "@/features/auth/tracks/table";
import { useGetTracks } from "@/hooks/tracks";

export default function IndexPage() {
  const { tracks } = useGetTracks();

  return (
    <>
      <Header />
      <TracksTable data={tracks} />
    </>
  );
}
