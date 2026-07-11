import { useGetTrack } from "@/hooks/tracks";
import type { Route } from "./+types/index";
import Header from "@/features/auth/modules/header";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModules } from "@/hooks/modules";

export default function IndexPage({ params }: Route.ComponentProps) {
  const { track, loading, error } = useGetTrack(params.slug);
  const { modules } = useGetModules();

  if (loading) return <p>Loading track...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!track) return <p>Track not found.</p>;

  const trackModules = modules.filter(
    (module) => module.track_id === track.id,
  );

  return (
    <>
      <Header track={track} />
      <ModulesTable data={trackModules} />
    </>
  );
}
