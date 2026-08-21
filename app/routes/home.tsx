import type { Route } from "./+types/home";
import { LandingPage } from "../components/landing-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Webtech Training Camp - Master Web Development" },
    { name: "description", content: "Learn modern web development through hands-on projects, expert mentorship, and industry-ready curriculum at Webtech Training Camp." },
  ];
}

export default function Home() {
  return <LandingPage />;
}
