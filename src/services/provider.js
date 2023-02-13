import http from "./http";
import { API_URL_ENDPOINT } from "@env";

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/provider`;

async function getProviderData() {
  const response = await http.get(`${API_ENDPOINT}/`);
  return response;
}

async function updateProviderData(data) {
  const response = await http.put(`${API_ENDPOINT}/`, data);
  return response;
}

async function changeImage() {
  const response = await http.put(`${API_ENDPOINT}/image`);
  return response;
}

async function changeImageAsAdmin(providerId, image) {
  const response = await http.put(`${API_ENDPOINT}/image/admin`, {
    providerId,
    image,
  });
  return response;
}

async function deleteImage() {
  const response = await http.delete(`${API_ENDPOINT}/image`);
  return response;
}

async function deleteImageAsAdmin(providerId, image) {
  const response = await http.delete(`${API_ENDPOINT}/image/admin`, {
    data: { providerId, image },
  });
  return response;
}

/**
 *
 * @param {Number} startDate - start date in milliseconds in UTC
 * @returns {array} - array of timestamps is milliseconds in UTC
 */
async function getAvailabilityForWeek(startDate) {
  const response = await http.get(
    `${API_ENDPOINT}/availability/single-week?startDate=${startDate}`
  );
  return response;
}

/**
 *
 * @param {Number} startDate - start date in milliseconds in UTC
 * @returns {array} - array of timestamps is milliseconds in UTC
 */
async function getConsultationsForWeek(startDate) {
  const response = await http.get(
    `${API_ENDPOINT}/consultation/single-week?startDate=${startDate}`
  );
  return response;
}

/**
 *
 * @param {Number} startDate - start date timestamp in milliseconds in UTC
 * @param {Number} slot - slot timestamp in milliseconds in UTC
 */
async function addAvailableSlot(startDate, slot) {
  const response = await http.put(`${API_ENDPOINT}/availability/single-week`, {
    startDate: startDate.toString(),
    slot: slot.toString(),
  });
  return response;
}

/**
 *
 * @param {Number} startDate - start date timestamp in milliseconds in UTC
 * @param {Number} slot - slot timestamp in milliseconds in UTC
 */
async function removeAvailableSlot(startDate, slot) {
  const response = await http.delete(
    `${API_ENDPOINT}/availability/single-week`,
    {
      data: {
        startDate: startDate.toString(),
        slot: slot.toString(),
      },
    }
  );
  return response;
}

async function addTemplateAvailability(data) {
  const response = await http.put(
    `${API_ENDPOINT}/availability/template`,
    data
  );
  return response;
}

async function getAllProviders() {
  const response = await http.get(`${API_ENDPOINT}/all`);
  return response;
}

async function getProviderById(id) {
  const response = await http.get(`${API_ENDPOINT}/by-id?providerId=${id}`);
  return response;
}

/**
 *
 * @param {number} startDate the timestamp of the start date of the week
 * @param {number} day the timestamp of the desired day
 * @param {String} providerId the id of the provider
 * @returns {Promise} resolving to an array with all the slots for the day
 */
async function getAvailableSlotsForSingleDay(startDate, day, providerId) {
  const response = await http.get(
    `${API_ENDPOINT}/availability/single-day?providerId=${providerId}&startDate=${startDate}&day=${day}`
  );
  return response;
}

/**
 *
 * @param {String} clientId the id of the client
 * @param {String} providerId the id of the provider
 * @param {number} slotTimestamp the timestamp of the slot
 * @returns {Promise} resolving to and object with the "consultation_id"
 */
async function blockSlot(clientId, providerId, slotTimestamp) {
  const response = await http.post(`${API_ENDPOINT}/consultation/block`, {
    clientId,
    providerId,
    time: JSON.stringify(slotTimestamp / 1000),
  });
  return response;
}

/**
 *
 * @param {String} consultationId the id of the consultation
 * @returns {Promise}
 */
async function scheduleConsultation(consultationId) {
  const response = await http.put(`${API_ENDPOINT}/consultation/schedule`, {
    consultationId,
  });
  return response;
}

async function cancelConsultation(consultationId) {
  const res = await http.put(`${API_ENDPOINT}/consultation/cancel`, {
    consultationId,
  });
  return res;
}

async function rescheduleConsultation(consultationId, newConsultationId) {
  const res = await http.post(`${API_ENDPOINT}/consultation/reschedule`, {
    consultationId,
    newConsultationId,
  });
  return res;
}

/**
 *
 * @param {string} consultationId
 *
 * @returns {Promise}
 */
async function suggestConsultation(consultationId) {
  const res = await http.put(`${API_ENDPOINT}/consultation/suggest`, {
    consultationId,
  });
  return res;
}

async function getAllClients() {
  const res = await http.get(`${API_ENDPOINT}/clients`);
  return res;
}

async function getAllConsultationsByClientId(clientId) {
  const res = await http.get(
    `${API_ENDPOINT}/consultation/all/past/by-id?clientId=${clientId}`
  );
  return res;
}

async function getAllUpcomingConsultations() {
  const res = await http.get(`${API_ENDPOINT}/consultation/all/upcoming`);
  return res;
}

async function getAllPastConsultations() {
  const res = await http.get(`${API_ENDPOINT}/consultation/all/past`);
  return res;
}

async function getConsultationsForSingleDay(day) {
  const res = await http.get(
    `${API_ENDPOINT}/consultation/single-day?date=${JSON.stringify(day)}`
  );
  return res;
}

async function getCalendarData(startDate) {
  const startDateString = JSON.stringify(startDate);
  const res = await http.get(
    `${API_ENDPOINT}/calendar/five-weeks?startDate=${startDateString}`
  );
  return res;
}

async function acceptConsultation(consultationId) {
  const res = await http.put(`${API_ENDPOINT}/consultation/accept-suggest`, {
    consultationId,
  });
  return res;
}

async function rejectConsultation(consultationId) {
  const res = await http.put(`${API_ENDPOINT}/consultation/reject-suggest`, {
    consultationId,
  });
  return res;
}

async function getProviderByIdAsAdmin(id) {
  const res = await http.get(`${API_ENDPOINT}/by-id/admin?providerId=${id}`);
  return res;
}

async function updateProviderDataByIdAsAdmin(data) {
  const res = await http.put(`${API_ENDPOINT}/by-id/admin`, {
    ...data,
  });
  return res;
}

async function deleteProvider(password) {
  const res = await http.delete(`${API_ENDPOINT}/`, {
    data: { password },
  });
  return res;
}

async function deleteProviderByIdAsAdmin(id) {
  const res = await http.delete(`${API_ENDPOINT}/by-id/admin`, {
    data: {
      providerId: id,
    },
  });
  return res;
}

/**
 *
 * @param {String} consultationId the id of the consultation
 * @param {String} userType the type of the user - client or provider
 * @returns
 */
async function leaveConsultation(consultationId, userType) {
  const res = await http.put(`${API_ENDPOINT}/consultation/leave`, {
    consultationId,
    userType,
  });
  return res;
}

async function getConsultationsTime(consultationId) {
  const res = await http.get(
    `${API_ENDPOINT}/consultation/time?consultationId=${consultationId}`
  );
  return res;
}

const exportedFunctions = {
  addAvailableSlot,
  addTemplateAvailability,
  blockSlot,
  cancelConsultation,
  changeImage,
  deleteImage,
  getAllClients,
  getAllConsultationsByClientId,
  getAllUpcomingConsultations,
  getAllPastConsultations,
  getAllProviders,
  getAvailabilityForWeek,
  getAvailableSlotsForSingleDay,
  getConsultationsForSingleDay,
  getConsultationsForWeek,
  getProviderById,
  getProviderByIdAsAdmin,
  getProviderData,
  getCalendarData,
  removeAvailableSlot,
  rescheduleConsultation,
  scheduleConsultation,
  suggestConsultation,
  updateProviderData,
  acceptConsultation,
  rejectConsultation,
  updateProviderDataByIdAsAdmin,
  changeImageAsAdmin,
  deleteImageAsAdmin,
  deleteProvider,
  deleteProviderByIdAsAdmin,
  leaveConsultation,
  getConsultationsTime,
};
export default exportedFunctions;
