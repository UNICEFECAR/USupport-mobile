import http from "./http";
import Config from "react-native-config";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import Share from "react-native-share";

const { API_URL_ENDPOINT } = Config;

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
    data: { password, time: JSON.stringify(new Date().getTime()) },
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
async function addMoodTrack(mood, comment, emergency) {
  const response = await http.post(`${API_ENDPOINT}/mood-tracker`, {
    comment,
    mood,
    emergency,
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

async function checkActiveCampaign() {
  const response = await http.get(`${API_ENDPOINT}/check-active-campaign`);
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

async function getClientQuestions(languageId) {
  const response = await http.get(
    `${API_ENDPOINT}/my-qa/client-questions?languageId=${languageId}`
  );
  return response;
}

async function getQuestions(orderBy, languageId) {
  const response = await http.get(
    `${API_ENDPOINT}/my-qa/questions?orderBy=${orderBy}&languageId=${languageId}`
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

async function deleteChatHistory() {
  const response = await http.put(`${API_ENDPOINT}/chat-history`, {
    time: JSON.stringify(new Date().getTime()),
  });
  return response;
}

async function deleteMoodTrackerHistory() {
  const response = await http.put(
    `${API_ENDPOINT}/mood-tracker/history/delete`
  );
  return response;
}

async function getHasCompletedMoodTrackerEver() {
  const response = await http.get(`${API_ENDPOINT}/mood-tracker/has-completed`);
  return response;
}

/**
 *
 * @param {Object} payload
 * @param {number} payload.categoryId
 * @param {number} payload.articleId
 * @param {number} payload.videoId
 * @param {number} payload.podcastId
 * @param {number} payload.tagIds
 * @returns {Promise} the response of the request
 */
async function addClientCategoryInteraction(payload) {
  const response = await http.post(`${API_ENDPOINT}/add-category-interaction`, {
    ...payload,
  });
  return response;
}

async function getCategoryInteractions() {
  const response = await http.get(`${API_ENDPOINT}/category-interactions`);
  return response;
}

async function getOrganizations(filters) {
  let filtersQuery = "";

  if (filters.search) {
    filtersQuery += `&search=${filters.search}`;
  }

  if (filters.district) {
    filtersQuery += `&district=${filters.district}`;
  }

  if (filters.paymentMethod) {
    filtersQuery += `&paymentMethod=${filters.paymentMethod}`;
  }

  if (filters.userInteraction) {
    filtersQuery += `&userInteraction=${filters.userInteraction}`;
  }

  if (filters.specialisations && filters.specialisations.length > 0) {
    filtersQuery += `&specialisations=${filters.specialisations.join(",")}`;
  }

  const response = await http.get(
    `${API_ENDPOINT}/organization${filtersQuery ? `?${filtersQuery}` : ""}`
  );
  return response;
}

async function getOrganizationById(organizationId) {
  const response = await http.get(
    `${API_ENDPOINT}/organization/${organizationId}`
  );
  return response;
}

/**
 *
 * @param {string} suggestion
 * @param {string} type "information-portal" | "my-qa" | "consultations" | "organizations" | "mood-tracker"
 * @returns {Promise} the response of the request
 */
async function sendPlatformSuggestion({ suggestion, type }) {
  const response = await http.post(`${API_ENDPOINT}/add-platform-suggestion`, {
    suggestion,
    type,
  });
  return response;
}

async function addSOSCenterClick(payload) {
  const response = await http.post(
    `${API_ENDPOINT}/add-sos-center-click`,
    payload
  );
  return response;
}

async function getBaselineAssessmentQuestions() {
  const response = await http.get(
    `${API_ENDPOINT}/baseline-assessment/questions`
  );
  return response;
}

async function createBaselineAssessment() {
  const response = await http.post(
    `${API_ENDPOINT}/baseline-assessment/create-assessment`
  );
  return response;
}

async function addBaselineAssessmentAnswer({
  questionId,
  answerValue,
  baselineAssessmentId,
  currentPosition,
}) {
  const response = await http.post(
    `${API_ENDPOINT}/baseline-assessment/add-answer`,
    {
      questionId,
      answerValue,
      baselineAssessmentId,
      currentPosition,
    }
  );
  return response;
}

async function getBaselineAssessments() {
  const response = await http.get(
    `${API_ENDPOINT}/baseline-assessment/assessments`
  );
  return response;
}

async function getClientAnswersForBaselineAssessmentById(baselineAssessmentId) {
  const response = await http.get(
    `${API_ENDPOINT}/baseline-assessment/answers?assessmentId=${baselineAssessmentId}`
  );
  return response;
}

async function updateClientHasCheckedBaselineAssessment(
  hasCheckedBaselineAssessment
) {
  const response = await http.patch(
    `${API_ENDPOINT}/has-checked-baseline-assessment`,
    {
      hasCheckedBaselineAssessment,
    }
  );
  return response;
}

async function getLatestBaselineAssessment() {
  const response = await http.get(`${API_ENDPOINT}/baseline-assessment/latest`);
  return response;
}

async function getPersonalizedOrganizations() {
  const response = await http.get(`${API_ENDPOINT}/organization/personalized`);
  return response;
}

async function generateMoodTrackReport(payload) {
  const { startDate, endDate } = payload || {};

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);

  const response = await http.get(
    `${API_ENDPOINT}/mood-tracker/report?${queryParams.toString()}`
  );

  // The API returns JSON: { csvData, fileName, ... }
  // but we also support the fallback where the API returns raw CSV string.
  const responseData = response?.data;
  let csvString = "";
  let filename = "mood-track-report.csv";

  if (typeof responseData === "string") {
    // Server returned raw CSV
    csvString = responseData;
    const contentDisposition = response.headers?.["content-disposition"];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
  } else if (responseData && typeof responseData.csvData === "string") {
    // Server returned JSON with csvData
    csvString = responseData.csvData;
    if (responseData.fileName) {
      filename = responseData.fileName;
    }
  } else {
    // Unexpected shape; do a safe stringify so the user still gets a file
    csvString = JSON.stringify(responseData ?? {});
  }

  // Platform-specific handling
  if (Platform.OS === "web") {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true, message: "Report downloaded successfully" };
  }

  // Native (iOS/Android): save to app documents and open share sheet
  const ensuredFilename = filename?.toLowerCase().endsWith(".csv")
    ? filename
    : `${filename || "mood-track-report"}.csv`;
  const fileUri = `${FileSystem.documentDirectory}${ensuredFilename}`;

  await FileSystem.writeAsStringAsync(fileUri, csvString, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  try {
    await Share.open({
      url: fileUri,
      type: "text/csv",
      filename: ensuredFilename,
      failOnCancel: false,
      saveToFiles: true, // iOS Files app option
    });
  } catch (e) {
    // User may cancel share; ignore
  }

  return {
    success: true,
    message: "Report saved and share sheet opened",
    fileUri,
    filename: ensuredFilename,
  };
}
async function getOrganizationSpecializations() {
  const response = await http.get(
    `${API_ENDPOINT}/organization/specializations`
  );
  return response;
}

async function synthesizeTTS(payload) {
  const response = await http.post(`${API_ENDPOINT}/tts/synthesize/`, payload, {
    responseType: "arraybuffer",
    headers: {
      Accept: "audio/mpeg",
    },
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
  checkActiveCampaign,
  unblockSlot,
  addQuestion,
  getClientQuestions,
  getQuestions,
  addQuestionVote,
  deleteChatHistory,
  deleteMoodTrackerHistory,
  addClientCategoryInteraction,
  getCategoryInteractions,
  getOrganizations,
  getOrganizationById,
  sendPlatformSuggestion,
  createBaselineAssessment,
  getBaselineAssessmentQuestions,
  getBaselineAssessments,
  getClientAnswersForBaselineAssessmentById,
  updateClientHasCheckedBaselineAssessment,
  addBaselineAssessmentAnswer,
  getLatestBaselineAssessment,
  addSOSCenterClick,
  getPersonalizedOrganizations,
  generateMoodTrackReport,
  getOrganizationSpecializations,
  getHasCompletedMoodTrackerEver,
  synthesizeTTS,
};

export default exportedFunctions;
