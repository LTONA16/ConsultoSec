export function redirectToLoginOnUnauthorized(response: Response): void {
  if (response.status !== 401) return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}