import { Button } from "@/components/ui/button";
import type { ManagementData } from "@/types/global";
import { Link } from "react-router";

export default function IndexPage() {
  const data: ManagementData[] = [
    {
      name: "Tracks",
      url: "/tracks",
    },
    {
      name: "Modules",
      url: "/modules",
    },
    {
      name: "Lessons",
      url: "/lessons",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((item, index) => (
          <Link to={item.url} key={index}>
            <Button className="w-full">{item.name}</Button>
          </Link>
        ))}
      </div>
    </>
  );
}
