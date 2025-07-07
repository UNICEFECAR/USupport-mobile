import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/admin/organization`;

async function getOrganizationMetadata() {
  const response = await http.get(`${API_ENDPOINT}/metadata`);
  return response.data;
}

const exportedFunctions = {
  getOrganizationMetadata,
};

export default exportedFunctions;
