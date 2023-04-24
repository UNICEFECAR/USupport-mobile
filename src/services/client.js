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

async function changeImage(imageName) {
  const response = await http.put(`${API_ENDPOINT}/image`, {
    image: imageName,
  });
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
async function addMoodTrack(mood, comment) {
  const response = await http.post(`${API_ENDPOINT}/mood-tracker`, {
    comment,
    mood,
  });
  return response;
}

async function sendInformationPortalSuggestion(suggestion) {
  const response = await http.post(
    `${API_ENDPOINT}/information-portal-suggestion`,
    { suggestion }
  );
  return response;
}

async function addPlatformRating(payload) {
  const response = await http.post(`${API_ENDPOINT}/add-rating`, payload);
  return response;
}

async function getSecurityCheckAnswersByConsultationId(consultationId) {
  const response = await http.get(
    `${API_ENDPOINT}/consultation/security-check?consultationId=${consultationId}`
  );
  return response;
}

async function createConsultationSecurityCheck(payload) {
  const response = await http.post(
    `${API_ENDPOINT}/consultation/security-check`,
    payload
  );
  return response;
}

async function updateConsultationSecurityCheck(payload) {
  const response = await http.put(
    `${API_ENDPOINT}/consultation/security-check`,
    payload
  );
  return response;
}

async function getMoodTrackForToday() {
  const response = await http.get(`${API_ENDPOINT}/mood-tracker/today`);
  return response;
}

async function getMoodTrackEntries(limit, pageNum) {
  const response = await http.get(
    `${API_ENDPOINT}/mood-tracker/entries?limit=${limit}&pageNum=${pageNum}`
  );
  return response;
}

async function addPushNotificationToken(token) {
  const response = await http.put(
    `${API_ENDPOINT}/add-push-notification-token`,
    {
      pushNotificationToken: token,
    }
  );
  return response;
}

async function checkIsCouponAvailable(couponCode) {
  const response = await http.get(
    `${API_ENDPOINT}/check-coupon?couponCode=${couponCode}`
  );
  return response;
}

async function unblockSlot(consultationId) {
  const response = await http.put(`${API_ENDPOINT}/consultation/unblock-slot`, {
    consultationId,
  });
  return response;
}

async function addQuestion(question) {
  const response = await http.post(
    `${API_ENDPOINT}/my-qa/create-question`,
    question
  );
  return response;
}

async function getClientQuestions() {
  const response = await http.get(`${API_ENDPOINT}/my-qa/client-questions`);
  return response;
}

async function getQuestions(orderBy) {
  const response = await http.get(
    `${API_ENDPOINT}/my-qa/questions?orderBy=${orderBy}`
  );
  return response;
}

async function addQuestionVote(answerId, vote) {
  const response = await http.post(`${API_ENDPOINT}/my-qa/answer-vote`, {
    answerId,
    vote,
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
  sendInformationPortalSuggestion,
  addPlatformRating,
  getSecurityCheckAnswersByConsultationId,
  createConsultationSecurityCheck,
  updateConsultationSecurityCheck,
  getMoodTrackForToday,
  getMoodTrackEntries,
  addPushNotificationToken,
  checkIsCouponAvailable,
  unblockSlot,
  addQuestion,
  getClientQuestions,
  getQuestions,
  addQuestionVote,
};

export default exportedFunctions;
