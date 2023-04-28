import http from "./http";

import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;
const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/user`;

async function getActiveCountries() {
  const response = await http.get(`${API_ENDPOINT}/countries`);
  return response;
}

const exportedFunctions = {
  getActiveCountries,
};

export default exportedFunctions;
