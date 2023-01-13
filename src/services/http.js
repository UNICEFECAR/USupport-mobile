import axios from "axios";
import jwtDecode from "jwt-decode";
import { getItem, removeItem, setItem } from "./storage";
import { log } from "./log";
import { VITE_API_ENDPOINT, VITE_WEBSITE_URL, VITE_CMS_API_URL } from "@env";
const API_ENDPOINT = `${VITE_API_ENDPOINT}/v1/user`;

// On every request add the JWT token, language and country to the headers
axios.interceptors.request.use(async (config) => {
  const country = await getItem("country");
  const language = await getItem("language");
  config.headers["x-country-alpha-2"] = country || "KZ";
  config.headers["x-language-alpha-2"] = language || "en";

  const requestURI = axios.getUri(config) || "VITE CMS API URL";

  if (!requestURI.includes(VITE_CMS_API_URL)) {
    const token = await getItem("token");
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

const interceptError = async (error) => {
  if (error?.response?.status === 401) {
    if (error.response?.data.error.name === "REFRESH TOKEN NOT VALID") {
      removeItem("token");
      removeItem("token-expires-in");
      removeItem("refresh-token");

      return Promise.reject(error);
    } else if (error.response?.data.error.name === "ACCOUNT DEACTIVATED") {
      return Promise.reject(error);
    }

    const token = await getItem("token");
    const decoded = jwtDecode(token);
    const isTokenExpired = Date.now() >= decoded.exp * 1000;

    if (isTokenExpired) {
      const refreshToken = await getItem("refresh-token");
      const res = await axios.post(`${API_ENDPOINT}/refresh-token`, {
        refreshToken,
      });

      const {
        token: newToken,
        expiresIn,
        refreshToken: newRefreshToken,
      } = res.data;

      // Set the new token and refresh token in the local storage
      setItem("token", newToken);
      setItem("token-expires-in", expiresIn);
      setItem("refresh-token", newRefreshToken);

      error.config.headers = {}; // Clear the headers
      return axios.request(error.config); // Resend the original request
    }
  }

  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    log(error);
  }

  return Promise.reject(error);
};

// handle unexpected errors received from the api
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => interceptError(error)
);

const exportedFunctions = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  patch: axios.patch,
};

export default exportedFunctions;
