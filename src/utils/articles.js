/**
 *
 * @param {*} object with article data
 * @returns object with desctructured data for the article
 */
function destructureArticleData(article) {
  const articleId = article.id;
  const articleData = article.attributes;
  const body = articleData.body;
  const articleLabels = computeArticleLabels(articleData.labels?.data);
  const articleReadingTime = articleData.reading_time;
  const articleThumbnailImage =
    article.attributes?.image?.data?.attributes?.formats?.thumbnail?.url;
  const articleImageMedium =
    article.attributes?.image?.data?.attributes?.formats?.medium?.url;
  const articleImageSmall =
    article.attributes?.image?.data?.attributes?.formats?.small?.url;
  const categoryId = articleData.category?.data?.id;
  const categoryName = articleData.category?.data?.attributes?.name;
  const description = articleData.description;
  const creator =
    articleData.createdBy.data.attributes.firstname +
    " " +
    articleData.createdBy.data.attributes.lastname;

  return {
    id: articleId,
    title: articleData.title,
    imageThumbnail: articleThumbnailImage,
    imageMedium: articleImageMedium,
    imageSmall: articleImageSmall,
    readingTime: articleReadingTime,
    body: body,
    labels: articleLabels,
    creator: creator,
    categoryId: categoryId,
    categoryName: categoryName,
    description: description,
    likes: articleData.likes || 0,
    dislikes: articleData.dislikes || 0,
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
    likes,
    dislikes,
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
    likes: Number(likes),
    dislikes: Number(dislikes),
    creator: null,
  };
};

const destructurePodcastData = (data) => {
  const parts = data.attributes.url.split("/");
  const type = parts[parts.length - 2];
  const id = parts[parts.length - 1].split("?")[0];
  const spotifyId = `${type}/${id}`;

  const thumbnail = data.attributes.thumbnail;
  // Get thumbnail URLs with fallbacks
  const thumbnailData = thumbnail?.data?.attributes;
  const imageLarge = thumbnailData?.url || "";
  const imageMedium = thumbnailData?.formats?.small?.url || imageLarge;
  const imageSmall = thumbnailData?.formats?.thumbnail?.url || imageMedium;

  const categoryData = data.attributes.category?.data?.attributes;
  const categoryName = categoryData?.name || "";
  const categoryId = data.attributes.category?.data?.id || null;

  const labelsData = data.attributes.labels?.data || [];
  const labels = computeArticleLabels(labelsData || []);

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
    likes: Number(data.attributes.likes) || 0,
    dislikes: Number(data.attributes.dislikes) || 0,
    spotifyId,
  };
};

export { destructureArticleData, destructureVideoData, destructurePodcastData };
