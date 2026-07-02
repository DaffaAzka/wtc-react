import { Outlet, redirect } from "react-router";

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw redirect("/login");
  }
  return null;
}

export default function AuthLayout() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Outlet />
      </div>
    </>
  );
}
