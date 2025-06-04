export interface IAuthResponse {
  message?: string;
  accessToken?: string;
  user: {
    id: string;
    email: string;
  };
}
