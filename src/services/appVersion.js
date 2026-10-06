import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/user`;

async function getAppVersionStatus({ platform, version }) {
  const response = await http.get(`${API_ENDPOINT}/app-version`, {
    params: { platform, version },
  });
  return response;
}

const exportedFunctions = {
  getAppVersionStatus,
};

export default exportedFunctions;
