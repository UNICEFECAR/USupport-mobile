import jwtDecode from "jwt-decode";

/**
 * Checks if a JWT token is expired.
 * exp is in seconds since epoch; we compare with Date.now() (milliseconds).
 *
 * @param {string} token - JWT token string
 * @returns {boolean} true if token is missing, invalid, or expired
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return true;
  try {
    const decoded = jwtDecode(token);
    if (!decoded || typeof decoded.exp !== "number") return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}
