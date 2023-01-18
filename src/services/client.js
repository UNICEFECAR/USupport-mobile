import http from "./http";
import { API_URL_ENDPOINT } from "@env";

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/client`;

async function getClientData() {
  const response = await http.get(`${API_ENDPOINT}/`);
  return response;
}

async function getClientDataById(id) {
  const response = await http.get(`${API_ENDPOINT}/by-id?clientId=${id}`);
  return response;
}

async function updateClientData(data) {
  const response = await http.put(`${API_ENDPOINT}/`, data);
  return response;
}

async function deleteClientProfile(password) {
  const response = await http.delete(`${API_ENDPOINT}/`, {
    data: { password },
  });
  return response;
}

async function changeImage() {
  const response = await http.put(`${API_ENDPOINT}/image`);
  return response;
}

async function changeDataProcessingAgreement(dataProcessing) {
  const response = await http.put(`${API_ENDPOINT}/data-processing-agreement`, {
    dataProcessing,
  });
  return response;
}

async function deleteImage() {
  const response = await http.delete(`${API_ENDPOINT}/image`);
  return response;
}

async function getAllConsultations() {
  const response = await http.get(`${API_ENDPOINT}/consultation/all`);
  return response;
}

/**
 *
 * @param {number} date timestamp of the date
 * @param {string} mood the value of the mood
 * @returns {Promise} the response of the request
 */
async function addMoodTrack(date, mood) {
  const response = await http.post(`${API_ENDPOINT}/mood-track`, {
    date,
    mood,
  });
  return response;
}

const exportedFunctions = {
  addMoodTrack,
  getClientData,
  getClientDataById,
  updateClientData,
  deleteClientProfile,
  deleteImage,
  changeImage,
  changeDataProcessingAgreement,
  getAllConsultations,
};

export default exportedFunctions;
