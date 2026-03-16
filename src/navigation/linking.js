/**
 * Deep linking configuration for uSupport.
 * URLs use the scheme: usupport://path
 *
 * Examples:
 *   usupport://article/123     -> ArticleInformation with id 123
 *   usupport://video/456       -> VideoInformation with id 456
 *   usupport://podcast/789     -> PodcastInformation with id 789
 *   usupport://organization/1  -> OrganizationOverview with id 1
 *   usupport://login           -> Auth > Login
 *   usupport://select-provider?coupon=unicef -> SelectProvider with coupon param
 *   https://usupport.online/client/select-provider?coupon=unicef -> same (QR / web)
 *   https://staging.usupport.online/client/en/select-provider?coupon=unicef -> same (locale in URL)
 */

/** App custom scheme for direct deep links */
const SCHEME_PREFIX = "usupport://";

/** Web base URLs for universal links / QR (path after base is app path; may include optional /:locale/) */
const WEB_BASE_URL = "https://usupport.online/client";
const WEB_BASE_URL_STAGING = "https://staging.usupport.online/client";

const PREFIXES = [
  SCHEME_PREFIX,
  "https://usupport.app",
  WEB_BASE_URL,
  WEB_BASE_URL_STAGING,
];

/**
 * Strips known URL prefixes to get the relative path (and optional query string).
 * Handles both production and staging; path may start with locale segment (e.g. en/select-provider).
 */
function getPathFromUrl(url) {
  let rest = url.trim();
  if (rest.startsWith(SCHEME_PREFIX)) {
    rest = rest.slice(SCHEME_PREFIX.length);
  } else if (rest.startsWith(WEB_BASE_URL_STAGING + "/")) {
    rest = rest.slice((WEB_BASE_URL_STAGING + "/").length);
  } else if (rest.startsWith(WEB_BASE_URL_STAGING)) {
    rest = rest.slice(WEB_BASE_URL_STAGING.length);
  } else if (rest.startsWith(WEB_BASE_URL + "/")) {
    rest = rest.slice((WEB_BASE_URL + "/").length);
  } else if (rest.startsWith(WEB_BASE_URL)) {
    rest = rest.slice(WEB_BASE_URL.length);
  } else if (/^https?:\/\//i.test(rest)) {
    rest = rest.replace(/^https?:\/\/[^/]*\/?/, "");
  }
  return rest.replace(/^\/+/, "");
}

/** Matches common locale segment (e.g. en, ro, kk, en-GB) */
const LOCALE_SEGMENT_REGEX = /^[a-z]{2}(-[A-Za-z]{2})?$/;

/**
 * Drops leading path segment if it looks like a locale (e.g. en, ro).
 * e.g. ["en", "select-provider"] -> ["select-provider"]
 */
function stripLocaleFromSegments(segments) {
  if (segments.length > 1 && LOCALE_SEGMENT_REGEX.test(segments[0])) {
    return segments.slice(1);
  }
  return segments;
}

/**
 * Parses query string from a URL into an object.
 * @param {string} url - Full URL (e.g. usupport://path?coupon=unicef&foo=bar)
 * @returns {object} Key-value pairs (e.g. { coupon: "unicef" })
 */
function getQueryParamsFromUrl(url) {
  const queryStart = url.indexOf("?");
  if (queryStart === -1) return {};
  const queryString = url.slice(queryStart + 1);
  return queryString.split("&").reduce((acc, pair) => {
    const eq = pair.indexOf("=");
    const rawKey = eq === -1 ? pair : pair.slice(0, eq);
    const rawValue = eq === -1 ? "" : pair.slice(eq + 1);
    try {
      const key = rawKey ? decodeURIComponent(rawKey.replace(/\+/g, " ")) : "";
      const value = decodeURIComponent(rawValue.replace(/\+/g, " "));
      if (key) acc[key] = value;
    } catch {
      if (rawKey) acc[rawKey] = rawValue;
    }
    return acc;
  }, {});
}

/**
 * Path patterns for the Main (app) stack.
 * Add more paths here as needed for deep linking.
 */
const MAIN_APP_PATHS = {
  TabNavigation: "",
  ArticleInformation: "article/:id",
  VideoInformation: "video/:id",
  PodcastInformation: "podcast/:id",
  OrganizationOverview: "organization/:id",
  UserProfile: "profile",
  Articles: "articles",
  Videos: "videos",
  Podcasts: "podcasts",
  Organizations: "organizations",
  FAQ: "faq",
  Consultation: "consultation",
  SOSCenter: "sos",
  Notifications: "notifications",
  SelectProvider: "select-provider",
};

/**
 * Path patterns for the Auth stack.
 */
const AUTH_PATHS = {
  Welcome: "welcome",
  Login: "login",
  RegisterPreview: "register",
  ForgotPassword: "forgot-password",
};

/**
 * React Navigation linking config for NavigationContainer.
 * Root has two stacks: Auth and Main.
 */
export const linkingConfig = {
  prefixes: PREFIXES,
  config: {
    screens: {
      Auth: {
        path: "auth",
        screens: AUTH_PATHS,
      },
      Main: {
        path: "/",
        screens: MAIN_APP_PATHS,
      },
    },
  },
};

/**
 * Parses a deep link URL and returns React Navigation state for the Main stack.
 * Use when the user is logged in (e.g. pending link after login or in-app URL).
 *
 * @param {string} url - Full URL (e.g. usupport://article/123)
 * @returns {object|null} Navigation state for Main stack or null if not recognized
 */
export function getMainStackStateFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  const queryParams = getQueryParamsFromUrl(url);

  const path = getPathFromUrl(url).split("?")[0];
  const segments = stripLocaleFromSegments(
    path ? path.split("/").filter(Boolean) : []
  );

  if (segments.length === 0) {
    return { routes: [{ name: "TabNavigation" }], index: 0 };
  }

  const [screenOrResource, idOrAction] = segments;

  const resourceToScreen = {
    article: "ArticleInformation",
    video: "VideoInformation",
    podcast: "PodcastInformation",
    organization: "OrganizationOverview",
  };

  const pathToScreen = {
    profile: "UserProfile",
    articles: "Articles",
    videos: "Videos",
    podcasts: "Podcasts",
    organizations: "Organizations",
    faq: "FAQ",
    consultation: "Consultation",
    sos: "SOSCenter",
    notifications: "Notifications",
    "select-provider": "SelectProvider",
  };

  if (resourceToScreen[screenOrResource] && idOrAction) {
    const screen = resourceToScreen[screenOrResource];
    const paramNames = {
      ArticleInformation: "articleId",
      VideoInformation: "videoId",
      PodcastInformation: "podcastId",
      OrganizationOverview: "organizationId",
    };
    const paramKey = paramNames[screen] || "id";
    return {
      routes: [
        { name: "TabNavigation" },
        {
          name: screen,
          params: { [paramKey]: idOrAction, ...queryParams },
        },
      ],
      index: 1,
    };
  }

  if (pathToScreen[screenOrResource]) {
    return {
      routes: [
        { name: "TabNavigation" },
        {
          name: pathToScreen[screenOrResource],
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        },
      ],
      index: 1,
    };
  }

  return null;
}

/**
 * Parses a deep link URL and returns React Navigation state for the Auth stack.
 *
 * @param {string} url - Full URL (e.g. usupport://auth/login)
 * @returns {object|null} Navigation state for Auth stack or null
 */
export function getAuthStackStateFromUrl(url) {
  if (!url || typeof url !== "string") return null;

  const path = getPathFromUrl(url).split("?")[0];
  const segments = stripLocaleFromSegments(
    path ? path.split("/").filter(Boolean) : []
  );

  const pathToScreen = {
    login: "Login",
    "forgot-password": "ForgotPassword",
    register: "RegisterPreview",
    welcome: "Welcome",
  };

  const screen = pathToScreen[segments[0]] || pathToScreen[segments[1]];
  if (screen) {
    return { routes: [{ name: screen }], index: 0 };
  }

  return null;
}

export { PREFIXES };
