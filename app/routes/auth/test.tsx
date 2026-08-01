import { useMemo } from "react";

export default function AuthTest() {
  const user = useMemo(() => {
    const data = localStorage.getItem("user");

    return data ? JSON.parse(data) : null;
  }, []);

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "sans-serif",
      }}
    >
      <h1>✅ PinatAuth Connected</h1>

      <hr />

      <h3>User</h3>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <hr />

      <h3>Access Token</h3>

      <textarea rows={8} style={{ width: "100%" }} value={localStorage.getItem("token") ?? ""} readOnly />

      <hr />

      <h3>Refresh Token</h3>

      <textarea rows={8} style={{ width: "100%" }} value={localStorage.getItem("refresh_token") ?? ""} readOnly />
    </div>
  );
}
