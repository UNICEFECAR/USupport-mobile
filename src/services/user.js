import http from "./http";
import jwtDecode from "jwt-decode";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;
import localStorage from "./storage";

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/user`;

async function getUserID() {
  const token = await localStorage.getItem("token");
  if (!token) return null;
  const decoded = jwtDecode(token);
  return decoded.sub;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("token-expires-in");
  localStorage.removeItem("refresh-token");
}

/**
 *
 * @param {string} userType the type of user - either "client" or "provider"
 * @param {string} countryId the id of the country
 * @param {string} password the password of the user
 * @param {string} clientData the data of the client
 * @param {string} providerData the data of the provider
 *
 * @returns {promise} the promise of the http request
 */
async function signUp({
  userType,
  countryID,
  password,
  clientData = {},
  providerData = {},
}) {
  let data = {
    userType,
    countryID,
    password,
    isMobile: true,
  };

  if (userType === "client") {
    data.clientData = clientData;
  } else if (userType === "provider") {
    data.providerData = providerData;
  }

  const response = await http.post(`${API_ENDPOINT}/signup`, data);

  delete data.password;
  delete data.userAccessToken;
  delete data.email;

  data = null;

  return response;
}

async function generateClientAccesToken() {
  const response = await http.get(`${API_ENDPOINT}/user-access-token`);
  return response;
}

async function refreshToken(refreshToken) {
  const response = await http.post(`${API_ENDPOINT}/refresh-token`, {
    refreshToken,
  });
  return response;
}

async function login({ userType, email, password, userAccessToken, location }) {
  let payload = { userType, password, isMobile: true };
  if (userAccessToken) {
    payload.userAccessToken = userAccessToken;
  } else {
    payload.email = email.toLowerCase().trim();
  }
  const headers = { "x-location": location };
  const response = await http.post(`${API_ENDPOINT}/login`, payload, {
    headers,
  });

  delete payload.password;
  delete payload.userAccessToken;
  delete payload.email;

  payload = null;

  return response;
}

async function tmpLogin() {
  const response = await http.post(`${API_ENDPOINT}/tmp-login`);
  return response;
}

async function changePassword({ oldPassword, newPassword }) {
  const response = await http.patch(`${API_ENDPOINT}/password`, {
    oldPassword,
    newPassword,
  });
  return response;
}

async function uploadFile(content) {
  const response = await http.post(`${API_ENDPOINT}/upload-file`, content, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
}

async function uploadFileAsAdmin(content) {
  const response = await http.post(
    `${API_ENDPOINT}/upload-file/admin`,
    content,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response;
}

async function getNotificationPreferences() {
  const response = await http.get(`${API_ENDPOINT}/notification-preferences`);
  return response;
}
/**
 * 
 * @param {Object} data
 * @param {boolean} data.email
 * @param {boolean} data.consultationReminder
 * @param {Number} data.consultationReminderTime
 * @param {boolean} data.inPlatform
 * @param {boolean} data.push 
 
 * @returns 
 */
async function updateNotificationPreferences(data) {
  const response = await http.put(`${API_ENDPOINT}/notification-preferences`, {
    ...data,
  });
  return response;
}
/**
 *
 * @param {String} email -> the email of the user
 * @param {String} type -> the type of the user "client" or "provider"
 * @returns
 */
async function generateForgotPasswordLink(email, type) {
  const response = await http.post(
    `${API_ENDPOINT}/rescue/forgot-password-link`,
    {
      email,
      type,
    }
  );
  return response;
}

async function resetPassword(password, token) {
  const response = await http.post(`${API_ENDPOINT}/rescue/forgot-password`, {
    token,
    password,
  });
  return response;
}

async function getWorkWithCategories() {
  const response = await http.get(`${API_ENDPOINT}/work-with`);
  return response;
}

async function createProvider(data) {
  const countryID = await localStorage.getItem("country_id");
  let password = data.password;
  delete data.password;
  const response = await http.post(`${API_ENDPOINT}/provider/signup`, {
    userType: "provider",
    countryID,
    password,
    providerData: data,
  });

  password = null;

  return response;
}

async function getTwilioToken(consultationId) {
  const response = await http.get(
    `${API_ENDPOINT}/consultation/twilio-token?consultationId=${consultationId}`
  );
  return response;
}

function transformUserData(data) {
  return {
    clientID: data.client_detail_id,
    accessToken: data.access_token,
    email: data.email || "",
    name: data.name || "",
    surname: data.surname || "",
    nickname: data.nickname || "",
    sex: data.sex || "",
    yearOfBirth: data.year_of_birth || "",
    image: data.image,
    urbanRural: data.urban_rural || "",
    dataProcessing: data.data_processing,
  };
}

async function changeLanguage(language) {
  const response = await http.put(`${API_ENDPOINT}/change-language`, {
    language,
  });
  return response;
}

async function requestEmailOTP(email) {
  const response = await http.post(`${API_ENDPOINT}/email-otp`, {
    email,
  });
  return response;
}

async function logoutRequest() {
  try {
    const response = await http.post(`${API_ENDPOINT}/logout`);
    return response;
  } catch (e) {
    console.log("Error logging out", e);
  }
}

const exportedFunctions = {
  changePassword,
  generateClientAccesToken,
  generateForgotPasswordLink,
  getNotificationPreferences,
  getUserID,
  getWorkWithCategories,
  getTwilioToken,
  login,
  logout,
  refreshToken,
  resetPassword,
  signUp,
  tmpLogin,
  updateNotificationPreferences,
  uploadFile,
  uploadFileAsAdmin,
  createProvider,
  transformUserData,
  changeLanguage,
  requestEmailOTP,
  logoutRequest,
};

export default exportedFunctions;
