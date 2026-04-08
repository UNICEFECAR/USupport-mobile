import http from "./http";
import Config from "react-native-config";
const { API_URL_ENDPOINT } = Config;

const API_ENDPOINT = `${API_URL_ENDPOINT}/v1/notifications`;

/**
 *
 * @param {Number} pageNumber
 * @param {string} [type] all | new | read
 * @returns
 */
async function getNotifications(pageNumber = 1, type = "all") {
  const response = await http.get(
    `${API_ENDPOINT}/user?pageNo=${pageNumber}&type=${type}`
  );
  return response;
}

async function checkHasUnreadNotifications() {
  const response = await http.get(`${API_ENDPOINT}/user-has-unread`);
  return response;
}

/**
 *
 * @param {Array} notificationIds
 * @returns {Promise}
 */
async function markNotificationsAsRead(notificationIds) {
  const response = await http.put(`${API_ENDPOINT}/is-read`, {
    notificationIds,
  });
  return response;
}

async function markAllNotificationsAsRead() {
  const response = await http.put(`${API_ENDPOINT}/read-all`);
  return response;
}

const exportedFunctions = {
  getNotifications,
  checkHasUnreadNotifications,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
};

export default exportedFunctions;
