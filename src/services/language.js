import http from "./http";
import { VITE_API_ENDPOINT } from "@env";

const API_ENDPOINT = `${VITE_API_ENDPOINT}/v1/user`;

async function getActiveLanguages() {
  const response = await http.get(`${API_ENDPOINT}/languages`);
  return response;
}
async function getAllLanguages() {
  const response = await http.get(`${API_ENDPOINT}/languages/all`);
  return response;
}

const exportedFunctions = {
  getActiveLanguages,
  getAllLanguages,
};

export default exportedFunctions;
