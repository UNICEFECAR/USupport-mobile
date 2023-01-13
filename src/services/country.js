import http from "./http";

import { VITE_API_ENDPOINT } from "@env";
const API_ENDPOINT = `${VITE_API_ENDPOINT}/v1/user`;

async function getActiveCountries() {
  const response = await http.get(`${API_ENDPOINT}/countries`);
  return response;
}

const exportedFunctions = {
  getActiveCountries,
};

export default exportedFunctions;
