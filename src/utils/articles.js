import { userSvc } from "../services";

/**
 *
 * @param {*} object with article data
 * @returns object with desctructured data for the article
 */
function destructureArticleData(article) {
  const articleId = article.id;

  const articleData = article.attributes;

  const body = articleData.body;
  const bodyCK = articleData.body_ck;
  const articleLabels = computeArticleLabels(articleData.labels?.data);
  const articleReadingTime = articleData.reading_time;

  const imageData = article.attributes?.image?.data?.attributes;

  let unformattedImage = imageData?.url || "";

  const articleThumbnailImage =
    imageData?.formats?.thumbnail?.url || unformattedImage;
  const articleImageMedium = imageData?.formats?.medium?.url;
  const articleImageSmall = imageData?.formats?.small?.url;
  const categoryId = articleData.category?.data?.id;
  const categoryName = articleData.category?.data?.attributes?.name;
  const description = articleData.description;
  const creator =
    articleData.createdBy?.data.attributes.firstname +
    " " +
    articleData.createdBy?.data.attributes.lastname;

  return {
    id: articleId,
    title: articleData.title,
    imageThumbnail: articleThumbnailImage,
    imageMedium: articleImageMedium,
    imageSmall: articleImageSmall,
    readingTime: articleReadingTime,
    body,
    bodyCK,
    labels: articleLabels,
    creator,
    categoryId,
    categoryName,
    description,
    likes: article.likes || 0,
    dislikes: article.dislikes || 0,
  };
}

function computeArticleLabels(labels) {
  return labels?.map((label) => {
    return { name: label.attributes.Name, id: label.id };
  });
}

const destructureVideoData = (videoData) => {
  // Handle case when video data is missing
  if (!videoData || !videoData.attributes) {
    return {};
  }
  const { id } = videoData;
  const {
    title,
    description,
    url,
    createdAt,
    updatedAt,
    publishedAt,
    thumbnail,
    category,
    labels: labelsData,
    vimeoThumbnailUrl,
  } = videoData.attributes;

  // Get thumbnail URLs with fallbacks
  const thumbnailData = thumbnail?.data?.attributes;
  const imageLarge = thumbnailData?.url || "";
  const imageMedium = thumbnailData?.formats?.small?.url || imageLarge;
  const imageSmall = thumbnailData?.formats?.thumbnail?.url || imageMedium;

  // Get category data if available
  const categoryData = category?.data?.attributes;
  const categoryName = categoryData?.name || "";
  const categoryId = category?.data?.id || null;

  const labels = computeArticleLabels(labelsData?.data || []);

  // Parse video URL to extract video ID for embedding
  let videoId = "";
  let image = "";
  try {
    if (url && url.includes("youtube.com")) {
      // Extract YouTube video ID
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get("v") || "";
      image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else if (url && url.includes("youtu.be")) {
      // Handle youtu.be short links
      videoId = url.split("/").pop().split("?")[0];
      image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else if (url && url.includes("vimeo.com")) {
      videoId = url.split("/").pop().split("?")[0];
      image = vimeoThumbnailUrl;
    }
  } catch (error) {
    console.error("Error parsing video URL:", error);
  }

  const likes = Object.hasOwn(videoData, "likes")
    ? Number(videoData.likes)
    : Number(videoData.attributes?.likes);
  const dislikes = Object.hasOwn(videoData, "dislikes")
    ? Number(videoData.dislikes)
    : Number(videoData.attributes?.dislikes);

  return {
    id,
    title,
    description,
    originalUrl: url,
    videoId,
    createdAt,
    updatedAt,
    publishedAt,
    imageLarge,
    imageMedium,
    imageSmall,
    categoryName,
    categoryId,
    labels,
    vimeoThumbnailUrl,
    image,
    likes,
    dislikes,
    creator: null,
  };
};

const destructurePodcastData = async (data) => {
  const parts = data.attributes.url.split("/");
  const type = parts[parts.length - 2];
  const id = parts[parts.length - 1].split("?")[0];
  const spotifyId = `${type}/${id}`;
  const thumbnail = data.attributes.thumbnail;
  // Get thumbnail URLs with fallbacks
  const thumbnailData = thumbnail?.data?.attributes;
  let imageLarge = thumbnailData?.url || "";
  let imageMedium = thumbnailData?.formats?.small?.url || imageLarge;
  let imageSmall = thumbnailData?.formats?.thumbnail?.url || imageMedium;

  // If CMS thumbnails are missing, try to fetch from Spotify
  if (!imageLarge && spotifyId) {
    const spotifyThumbnail = await getSpotifyThumbnail(spotifyId);
    if (spotifyThumbnail) {
      imageLarge = spotifyThumbnail;
      imageMedium = spotifyThumbnail;
      imageSmall = spotifyThumbnail;
    }
  }

  const categoryData = data.attributes.category?.data?.attributes;
  const categoryName = categoryData?.name || "";
  const categoryId = data.attributes.category?.data?.id || null;

  const labelsData = data.attributes.labels?.data || [];
  const labels = computeArticleLabels(labelsData || []);

  const likes = Object.hasOwn(data, "likes")
    ? Number(data.likes)
    : Number(data.attributes?.likes);
  const dislikes = Object.hasOwn(data, "dislikes")
    ? Number(data.dislikes)
    : Number(data.attributes?.dislikes);

  return {
    id: data.id,
    title: data.attributes.title,
    description: data.attributes.description,
    url: data.attributes.url,
    imageLarge,
    imageMedium,
    imageSmall,
    categoryName,
    categoryId,
    labels,
    view_count: Number(data.attributes.view_count) || 0,
    likes,
    dislikes,
    spotifyId,
  };
};

/**
 * Fetches thumbnail URL for a Spotify podcast episode using Spotify's oEmbed API
 * @param {string} spotifyId - Spotify ID in format "episode/{id}" or "show/{id}"
 * @returns {Promise<string|null>} - Thumbnail URL or null if fetch fails
 */
const getSpotifyThumbnail = async (spotifyId) => {
  if (!spotifyId) return null;

  try {
    const spotifyUrl = `https://open.spotify.com/${spotifyId}`;
    const oEmbedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(
      spotifyUrl
    )}&format=json`;

    const response = await fetch(oEmbedUrl);
    if (!response.ok) {
      console.warn(`Spotify oEmbed API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.thumbnail_url || null;
  } catch (error) {
    console.error("Error fetching Spotify thumbnail:", error);
    return null;
  }
};

const isLikedOrDislikedByUser = ({
  contentType,
  contentData,
  userEngagements,
}) => {
  let isLiked = false;
  let isDisliked = false;

  if (!userEngagements || !contentData)
    return { isLiked: false, isDisliked: false };

  for (const {
    content_type: type,
    content_id: id,
    action,
  } of userEngagements) {
    if (type === contentType && id === contentData.id) {
      if (action === "like") isLiked = true;
      if (action === "dislike") isDisliked = true;
      if (isLiked && isDisliked) break; // early exit if both found
    }
  }

  return { isLiked, isDisliked };
};

/**
 *
 * @param {String[]} ids - Array of content IDs
 * @param {String} contentType - Type of content ("article", "video", "podcast")
 * @returns {Object} - Object with content likes and dislikes
 * @property {Map<string, number>} likes - Map of content ids and their likes
 * @property {Map<string, number>} dislikes - Map of content ids and their dislikes
 */
const getLikesAndDislikesForContent = async (ids, contentType = "article") => {
  if (!ids) return { likes: new Map(), dislikes: new Map() };
  const { data } = await userSvc.getContentEngagementsById({
    ids: ids,
    contentType: contentType,
  });

  const likes = new Map();
  const dislikes = new Map();

  data.forEach((engagement) => {
    const { content_id: id, action } = engagement;
    if (action === "like") {
      if (likes.has(id)) {
        likes.set(id, likes.get(id) + 1);
      } else {
        likes.set(id, 1);
      }
    } else if (action === "dislike") {
      if (dislikes.has(id)) {
        dislikes.set(id, dislikes.get(id) + 1);
      } else {
        dislikes.set(id, 1);
      }
    }
  });
  return {
    likes,
    dislikes,
  };
};

export {
  destructureArticleData,
  destructureVideoData,
  destructurePodcastData,
  getSpotifyThumbnail,
  isLikedOrDislikedByUser,
  getLikesAndDislikesForContent,
};
