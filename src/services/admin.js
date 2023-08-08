import http from "./http";
import localStorage from "./storage";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/admin`;
const API_ENDPOINT_COUNTRIES_FAQ = API_ENDPOINT + "/country/faqs";
const API_ENDPOINT_COUNTRIES_SOS_CENTERS =
  API_ENDPOINT + "/country/sos-centers";
const API_ENDPOINT_COUNTRIES_ARTICLES = API_ENDPOINT + "/country/articles";

async function createAdmin(payload) {
  const response = await http.post(`${API_ENDPOINT}/signup`, payload);
  return response;
}

async function deleteAdminById(id) {
  const response = await http.delete(`${API_ENDPOINT}/by-id`, {
    data: { adminId: id },
  });
  return response;
}

async function login(email, password, role) {
  const response = await http.post(`${API_ENDPOINT}/login`, {
    email: email.toLowerCase(),
    password: password,
    role,
  });
  return response;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("token-expires-in");
  localStorage.removeItem("refresh-token");
}

async function refreshToken(refreshToken) {
  const response = await http.post(`${API_ENDPOINT}/refresh-token`, {
    refreshToken,
  });
  return response;
}

/**
 *
 * @param {String} email -> the email of the admin
 * @returns
 */
async function generateForgotPasswordLink(email, role) {
  const response = await http.get(
    `${API_ENDPOINT}/rescue/forgot-password?email=${email}&role=${role}`
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

async function getData() {
  const response = await http.get(`${API_ENDPOINT}/`);
  return response;
}

async function getDataById(id) {
  const response = await http.get(`${API_ENDPOINT}/by-id?adminId=${id}`);
  return response;
}

async function updateData(payload) {
  const response = await http.put(`${API_ENDPOINT}/`, payload);
  return response;
}

async function updateDataById(id, payload) {
  const response = await http.put(
    `${API_ENDPOINT}/by-id?adminId=${id}`,
    payload
  );
  return response;
}

/**
 *
 * @param {string} platform the platform of the faqs. Accepts: website, client, or provider.
 *
 * @returns {object} the object containing the data for the FAQS.
 */
async function getFAQs(platform) {
  const response = await http.get(
    `${API_ENDPOINT_COUNTRIES_FAQ}?platform=${platform}`
  );
  return response.data;
}

/**
 *
 * @param {string} platform the platform of the faqs. Accepts: website, client, or provider.
 * @param {string} id the id of the faq to be added.
 *
 * @returns {promise} the promise of the http request
 */
async function putFAQ(platform, id) {
  const response = await http.put(`${API_ENDPOINT_COUNTRIES_FAQ}`, {
    platform: platform,
    id: id,
  });
  return response;
}

/**
 
 * @param {string} platform the platform of the faqs. Accepts: website, client, or provider.
 * @param {string} id the id of the faq to be deleted.
 * 
 * @returns {promise} the promise of the http request
 */
async function deleteFAQ(platform, id) {
  const response = await http.delete(`${API_ENDPOINT_COUNTRIES_FAQ}`, {
    data: { platform: platform, id: id },
  });
  return response;
}
/**
 *
 * @returns {object} the object containing the data for the SOS Centers.
 *
 */
async function getSOSCenters() {
  const response = await http.get(`${API_ENDPOINT_COUNTRIES_SOS_CENTERS}`);
  return response.data;
}

/**
 *
 * @param {string} id the id of the SOS center to be added
 *
 * @returns {promise} the promise of the http request
 *
 */
async function putSOSCenters(id) {
  const response = await http.put(`${API_ENDPOINT_COUNTRIES_SOS_CENTERS}`, {
    id: id,
  });
  return response;
}

/**
 *
 * @param {string} id the id of the SOS center to be deleted
 *
 * @returns {promise} the promise of the http request
 *
 */
async function deleteSOSCenters(id) {
  const response = await http.delete(`${API_ENDPOINT_COUNTRIES_SOS_CENTERS}`, {
    data: { id: id },
  });
  return response;
}

/**
 *
 * @returns {object} the object containing the data for the articles.
 *
 */
async function getArticles() {
  const response = await http.get(`${API_ENDPOINT_COUNTRIES_ARTICLES}`);
  return response.data;
}

/**
 *
 * @param {string} id the id of the article to be added
 *
 * @returns {promise} the promise of the http request
 *
 */
async function putArticle(id) {
  const response = await http.put(`${API_ENDPOINT_COUNTRIES_ARTICLES}`, {
    id: id,
  });
  return response;
}

/**
 *
 * @param {string} id the id of the article to be deleted
 *
 * @returns {promise} the promise of the http request
 *
 */
async function deleteArticle(id) {
  const response = await http.delete(`${API_ENDPOINT_COUNTRIES_ARTICLES}`, {
    data: { id: id },
  });
  return response;
}

async function getAllGlobalAdmins() {
  const response = await http.get(`${API_ENDPOINT}/all?type=global`);
  return response;
}

async function getAllCountryAdminsByCountry(countryId) {
  const response = await http.get(
    `${API_ENDPOINT}/all?type=country&countryId=${countryId}`
  );
  return response;
}

async function getGlobalStatistics() {
  const response = await http.get(`${API_ENDPOINT}/statistics/global`);
  return response;
}

async function getCountryStatistics(countryId) {
  const response = await http.get(
    `${API_ENDPOINT}/statistics/country?countryId=${countryId}`
  );
  return response;
}

const exportedFunctions = {
  createAdmin,
  deleteArticle,
  deleteAdminById,
  deleteFAQ,
  deleteSOSCenters,
  generateForgotPasswordLink,
  getAllGlobalAdmins,
  getAllCountryAdminsByCountry,
  getGlobalStatistics,
  getCountryStatistics,
  getArticles,
  getData,
  getDataById,
  getFAQs,
  getSOSCenters,
  login,
  logout,
  putArticle,
  putFAQ,
  putSOSCenters,
  refreshToken,
  resetPassword,
  updateData,
  updateDataById,
};

export default exportedFunctions;
