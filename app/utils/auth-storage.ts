export function getToken() {
    return localStorage.getItem("token");
}

export function saveToken(token: string) {
    localStorage.setItem("token", token);
}

export function getRefreshToken() {
    return localStorage.getItem("refresh_token");
}

export function saveRefreshToken(token: string) {
    localStorage.setItem("refresh_token", token);
}

export function getUser() {
    const data = localStorage.getItem("user");

    return data
        ? JSON.parse(data)
        : null;
}

export function saveUser(user: unknown) {
    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
}

export function isLoggedIn() {

    return !!getToken();
}

export function hasRefreshToken() {

    return !!getRefreshToken();
}

export function clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
}