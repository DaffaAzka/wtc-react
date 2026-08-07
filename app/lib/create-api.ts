import axios from "axios";

export function createApi(baseURL: string) {
    const instance = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
        },
    });

    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {

            if (error.response?.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                location.href="/login";

            }

            return Promise.reject(error);

        }
    );

    return instance;
}