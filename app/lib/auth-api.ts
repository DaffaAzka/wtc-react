import { createApi } from "./create-api";

export const authApi = createApi(
    import.meta.env.VITE_AUTH_URL
);