import { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import { userSvc, localStorage } from "#services";

export const useIsLoggedIn = () => {
  const platform = window.location.pathname.split("/")[1];

  const [result, setResult] = useState("loading");
  const [shouldRefreshToken, setShouldRefreshToken] = useState(false);

  // Define the API call to refresh the token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh-token");
    const res = await userSvc.refreshToken(refreshToken);
    return res;
  };

  // Define the query that sends the request
  // This is enabled only if the JWT token is expired
  const refreshTokenQuery = useQuery(["refresh-token"], refreshToken, {
    onSuccess: (response) => {
      const { token, expiresIn, refreshToken } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      const decoded = decodeToken();
      if (Date.now() >= decoded.exp * 1000) {
        throw new Error("Token expired");
      }
    },
    onError: () => {
      throw new Error("Token expired");
    },
    retry: false,
    enabled: shouldRefreshToken,
  });

  // Decode the JWT token to a readable object
  const decodeToken = () => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    return decoded;
  };

  /**
   * used to get the data for the current user, specialist, or admin
   *
   * @returns {boolean} the user data or null if jwt token does not exists in the local storage
   */
  function validateUser() {
    try {
      const decoded = decodeToken();
      const country = localStorage.getItem("country");

      if (!country) {
        throw new Error("No country selected");
      }

      if (decoded.userType !== platform) {
        throw new Error("User type does not match platform");
      }

      let isQueryRunning = false;
      if (Date.now() >= decoded.exp * 1000) {
        // If the JWT token is expired set the shouldRefreshToken flag
        //  to true so the refreshTokenQuery will be enabled
        setShouldRefreshToken(true);
        isQueryRunning = true; // Local variable to track if the query is running, because the setState is running async
      }

      // If the query is enabled, check if it is still loading
      // If it is still loading, return the loading state
      // If it is not loading anymore and there was no error thrown, the token was refreshed
      // Otherwise we assume that the token is valid and return true
      return isQueryRunning
        ? refreshTokenQuery.isLoading
          ? "loading"
          : true
        : true;
    } catch (ex) {
      return false;
    }
  }

  // Call the validateUser function in a useEffect so we
  // dont end up calling it multiple times on every render
  useEffect(() => {
    const isLoggedIn = validateUser();
    setResult(isLoggedIn);
  }, []);

  return result;
};
