import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/video`;

async function updateConsultationStatus(data) {
  const res = await http.put(`${API_ENDPOINT}/status`, {
    ...data,
  });
  return res;
}

export default {
  updateConsultationStatus,
};
