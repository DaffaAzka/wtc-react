export type RefreshResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
};

export type LogoutResponse = {
    redirect_to: string;
};