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
    article.attributes.image.data.attributes.formats.thumbnail.url;
  const articleImageMedium =
    article.attributes.image.data.attributes.formats.medium.url;
  const articleImageSmall =
    article.attributes.image.data.attributes.formats.small.url;
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
    description: articleData.description,
    body: body,
    labels: articleLabels,
    creator: creator,
    readingTime: articleData.reading_time,
    categoryId: categoryId,
    categoryName: categoryName,
    description: description,
  };
}

function computeArticleLabels(labels) {
  return labels.map((label) => {
    return { name: label.attributes.Name };
  });
}

export { destructureArticleData };
