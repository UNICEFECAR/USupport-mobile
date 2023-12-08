import http from "./http";

import Config from "react-native-config";
const { CMS_API_URL_ENDPOINT } = Config;

const CMS_API_URL = `${CMS_API_URL_ENDPOINT}`;

const articlesEndpoint = CMS_API_URL + "/articles";
const ageGroupsEndpoint = CMS_API_URL + "/age-groups";
const categoriesEndpoint = CMS_API_URL + "/categories";
const policiesEndpoint = CMS_API_URL + "/privacy-policies";
const faqsEndpoint = CMS_API_URL + "/faqs";
const sosCentersEndpoint = CMS_API_URL + "/sos-centers";
const cookiePolicyEndpoint = CMS_API_URL + "/policy-cookies";
const termsOfUseEndpoint = CMS_API_URL + "/terms-of-uses";

/**
 * generate a querry string from an object
 *
 * @param {object} queryObj - the object to generate the querry string from
 * @param {string} queryObj.limit  - the number of documents to return
 * @param {number} queryObj.populate - whether to populate the data fully or not
 * @param {number} queryObj.startFrom - the starting index of the document to return
 * @param {string} queryObj.contains - the string to search for in the document title
 * @param {string} queryObj.ageGroupId - the age group id to filter by
 * @param {string} queryObj.categoryId - the category id to filter by
 * @param {string} queryObj.locale - the locale to filter by
 * @param {string} queryObj.sortBy - the field to sort by
 * @param {string} queryObj.sortOrder - the order to sort by, possible values are "asc" and "desc"
 * @param {string} queryObj.excludeId - the id to exclude from the results
 * @param {string} queryObj.countryAlpha2 - the country alpha2 code to filter by
 *
 */
function generateQuerryString(queryObj) {
  let querry = `?`;

  if (queryObj.locale) querry += `&locale=${queryObj.locale}`;

  if (queryObj.populate) {
    querry += "&populate=*";
  }

  if (queryObj.limit) {
    querry += `&pagination[limit]=${queryObj.limit}`;
  }

  if (queryObj.startFrom) {
    querry += `&pagination[start]=${queryObj.startFrom}`;
  }

  if (queryObj.contains && queryObj.contains !== "") {
    // Either the title or the label should contain the 'contains' string.
    querry += `&filters[$or][0][title][$containsi]=${queryObj.contains}&filters[$or][1][labels][name][$containsi]=${queryObj.contains}&filters[$or][2][category][name][$containsi]=${queryObj.contains}`;
  }

  if (queryObj.ageGroupId) {
    querry += `&filters[age_groups][id][$in]=${queryObj.ageGroupId}`;
  }

  if (queryObj.categoryId) {
    querry += `&filters[category][id][$in]=${queryObj.categoryId}`;
  }

  if (queryObj.sortBy && queryObj.sortOrder) {
    querry += `&sort=${queryObj.sortBy}:${queryObj.sortOrder}`;
  }

  if (queryObj.excludeId) {
    querry += `&filters[id][$notIn]=${queryObj.excludeId}`;
  }

  //This was added for the policies
  if (queryObj.countryAlpha2) {
    querry += `&country=${queryObj.countryAlpha2}`;
  }

  if (queryObj.global) {
    querry += `&filters[global][$in]=${queryObj.global}`;
  }

  if (queryObj.listOfIds) {
    for (let i = 0; i < queryObj.listOfIds.length; i++) {
      querry += `&filters[id][$in]=${queryObj.listOfIds[i]}`;
    }
  }

  if (queryObj.ids && queryObj.ids.length > 0) {
    querry += `&ids=${queryObj.ids}`;
  }

  // This was added for the admin to prevent the server to filter the data by selected ids.
  if (queryObj.isForAdmin) {
    querry += `&isForAdmin=${queryObj.isForAdmin}`;
  }

  if (queryObj.platform) {
    querry += `&platform=${queryObj.platform}`;
  }

  if (querry.includes("?&")) {
    querry = querry.replace("?&", "?");
  }

  return querry;
}

/**
 * send request to get multiple articles
 *
 * @param {object} queryObj - the object to generate the querry string from
 * @param {string} queryObj.limit  - the number of documents to return
 * @param {number} queryObj.populate - whether to populate the data fully or not
 * @param {number} queryObj.startFrom - the starting index of the document to return
 * @param {string} queryObj.contains - the string to search for in the document title
 * @param {string} queryObj.ageGroupId - the age group id to filter by
 * @param {string} queryObj.categoryId - the category id to filter by
 * @param {string} queryObj.locale - the locale to filter by
 * @param {string} queryObj.sortBy - the field to sort by
 * @param {string} queryObj.sortOrder - the order to sort by, possible values are "asc" and "desc"
 * @param {string} queryObj.excludeId - the id to exclude from the results
 * @param {string} queryObj.countryAlpha2 - the country alpha2 code to filter by
 * @param {string} queryObj.global - the global flag to filter by
 * @param {string} queryObj.listOfIds - the list of ids to filter by
 * @param {string} queryObj.ids - the ids to filter by
 *
 */

async function getArticles(queryObj) {
  const querryString = generateQuerryString(queryObj);
  console.log(querryString);
  const { data } = await http.get(`${articlesEndpoint}${querryString}`);
  console.log(data + "data");
  return { data };
}

/**
 * send request to get data for a specific article by id
 *
 * @param {string} id - the id of the article
 * @param {string} locale - the locale for which to retrieve articles
 *
 * @returns {object} the article data
 */
async function getArticleById(id, locale) {
  const querryString = generateQuerryString({ populate: true, locale: locale });

  try {
    // Increment read count for the given article id
    await addArticleReadCount(id);
  } catch (error) {
    console.log(error);
  }

  const { data } = await http.get(`${articlesEndpoint}/${id}${querryString}`);

  return data;
}

/**
 * send request to get available locales for a specific article, by id - Only used for testing from Postman
 *
 * @param {string} id - the id of the article
 *
 * @returns {object} all available article locales e.g. {"kk": 17,"en": 12,"ru": 18}
 */
async function getArticleLocales(id) {
  const { data } = await http.get(
    `${articlesEndpoint}/getArticleLocales/${id}`
  );

  return data;
}

// /**
//  * send request to get available locales for all the articles ids within an array - Only used for testing from Postman
//  *
//  * @param {array} arrayOfArticleIds - array of article ids e.g [10,12]
//  *
//  * @returns {object} all available article locales e.g {"10": {"en": 10,"kk": 15},"12": {"en": 12,"kk": 17,"ru": 18}}
//  */
// async function getArticleLocalesMapping(arrayOfArticleIds) {
//   try {
//     // Increment read count for the given article id
//     await addArticleReadCount(id);
//   } catch (error) {}

//   const { data } = await http.get(
//     `${articlesEndpoint}/locales/mapping?ids=${arrayOfArticleIds}`
//   );

//   return data;
// }

/**
 * send request to get all the categories
 *
 * @param {string} locale - the locale for which to retrieve categories
 *
 * @returns {object} the categories data
 */

async function getCategories(locale) {
  const querryString = generateQuerryString({
    locale: locale,
  });

  const { data } = await http.get(`${categoriesEndpoint}${querryString}`);
  return data;
}

//--------------------- PUT Requests ---------------------//;
/**
 * send request toincrement article count
 *
 * @param {string} id - the id of the article
 *
 * @returns {object} the ageGroups data
 */
async function addArticleReadCount(id) {
  return http.put(`${articlesEndpoint}/addReadCount/${id}`);
}

//--------------------- Categories ---------------------//;
/**
 * send request to get all ageGroups
 *
 * @param {string} locale - the locale for which to retrieve ageGroups
 *
 * @returns {object} the ageGroups data
 */
async function getAgeGroups(locale) {
  const querryString = generateQuerryString({
    locale: locale,
  });
  const { data } = await http.get(`${ageGroupsEndpoint}${querryString}`);
  return data;
}

//--------------------- Policies ---------------------//;
/**
 * send request to get privacy policies
 * @param {string} locale - the locale for which to retrieve policies
 * @returns {string} countryAlpha2 - the country 2 characters ISO-3166 code for which to retrieve policies
 * @returns {string} platform - the platform for which to retrieve policies e.g website, client or provider
 * @returns {object} the policies data
 *
 */
async function getPolicies(locale, countryAlpha2, platform) {
  const querryString = generateQuerryString({
    locale: locale,
    countryAlpha2: countryAlpha2,
    platform: platform,
  });
  let res = await http.get(`${policiesEndpoint}/find${querryString}`);

  return res;
}

//--------------------- Cookie Policy ---------------------//;
/**
 * send request to Cookie Policy
 * @param {string} locale - the locale for which to retrieve Cookie Policy
 * @returns {string} countryAlpha2 - the country 2 characters ISO-3166 code for which to retrieve Cookie Policy
 * @returns {string} platform - the platform for which to retrieve Cookie Policy e.g website, client or provider
 * @returns {object} the Cookie Policy data
 *
 */
async function getCookiePolicy(locale, countryAlpha2, platform) {
  const querryString = generateQuerryString({
    locale: locale,
    countryAlpha2: countryAlpha2,
    platform: platform,
  });
  let res = await http.get(`${cookiePolicyEndpoint}/find${querryString}`);

  return res;
}

//--------------------- Terms Of Use ---------------------//;
/**
 * send request to terms of use
 * @param {string} locale - the locale for which to retrieve Terms Of Use
 * @returns {string} countryAlpha2 - the country 2 characters ISO-3166 code for which to retrieve Terms Of Use
 * @returns {string} platform - the platform for which to retrieve Terms Of Use e.g website, client or provider
 * @returns {object} the Terms Of Use data
 *
 */
async function getTermsOfUse(locale, countryAlpha2, platform) {
  const querryString = generateQuerryString({
    locale: locale,
    countryAlpha2: countryAlpha2,
    platform: platform,
  });
  let res = await http.get(`${termsOfUseEndpoint}/find${querryString}`);

  return res;
}

//--------------------- FAQs ---------------------//;
/**
 * send request to get FAQs
 *
 * @returns {object} the FAQs data
 *
 */
async function getFAQs(queryObj) {
  const querryString = generateQuerryString(queryObj);

  const { data } = await http.get(`${faqsEndpoint}${querryString}`);

  return { data };
}

/**
 * send request to get available locales for a specific FAQ, by id
 *
 * @param {string} id - the id of the FAQ
 *
 * @returns {object} all available FAQ locales e.g. {"kk": 17,"en": 12,"ru": 18}
 */
async function getFAQAvailableLocales(id) {
  const { data } = await http.get(`${faqsEndpoint}/available-locales/${id}`);

  return data;
}

//--------------------- SOS Centers ---------------------//;
/**
 * send request to get SOS Centers
 *
 * @returns {object} the sos centers data
 *
 */
async function getSOSCenters(queryObj) {
  const querryString = generateQuerryString(queryObj);

  const { data } = await http.get(`${sosCentersEndpoint}${querryString}`);

  return { data };
}

/**
 * send request to get available locales for a specific SOS Center, by id
 *
 * @param {string} id - the id of the SOS Center
 *
 * @returns {object} all available SOS Center locales e.g. {"kk": 17,"en": 12,"ru": 18}
 */
async function getSOSCenterAvailableLocales(id) {
  const { data } = await http.get(
    `${sosCentersEndpoint}/available-locales/${id}`
  );

  return data;
}

export default {
  getArticles,
  getArticleById,
  getArticleLocales,
  // getArticleLocalesMapping,
  getCategories,
  getAgeGroups,
  addArticleReadCount,
  getPolicies,
  getCookiePolicy,
  getTermsOfUse,
  getFAQs,
  getFAQAvailableLocales,
  getSOSCenters,
  getSOSCenterAvailableLocales,
};
