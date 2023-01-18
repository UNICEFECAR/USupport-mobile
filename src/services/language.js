import http from "./http";
import { API_URL_ENDPOINT } from "@env";

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/user`;

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
