import { useGetTrack } from "@/hooks/tracks";
import type { Route } from "./+types/index";
import Header from "@/features/auth/modules/header";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModulesByTrack } from "@/hooks/modules";

export default function IndexPage({ params }: Route.ComponentProps) {
  const { track, loading, error } = useGetTrack(params.slug);
  const { modules } = useGetModulesByTrack(params.slug);

  if (loading) return <p>Loading track...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!track) return <p>Track not found.</p>;

  return (
    <>
      <Header track={track} />
      <ModulesTable data={modules} />
    </>
  );
}
