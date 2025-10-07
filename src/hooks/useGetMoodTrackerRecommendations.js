import { useQuery } from "@tanstack/react-query";

import { cmsSvc } from "#services";
import {
  destructureArticleData,
  destructurePodcastData,
  destructureVideoData,
} from "#utils";

export const useGetMoodTrackerRecommendations = (moodType, language) => {
  const getMoodTrackerRecommendations = async () => {
    const { data } = await cmsSvc.getMoodTrackerRecommendations(
      moodType,
      language
    );
    const innerData = data.data;
    if (innerData.length) {
      const attributes = innerData[0].attributes;

      const { articles, podcasts, videos } = attributes;

      const articlesData = articles.data.map((article) =>
        destructureArticleData(article)
      );
      const podcastsData = podcasts.data.map((podcast) =>
        destructurePodcastData(podcast)
      );
      const videosData = videos.data.map((video) =>
        destructureVideoData(video)
      );

      return {
        articles: articlesData,
        podcasts: podcastsData,
        videos: videosData,
        hasRecommendations:
          articlesData.length > 0 ||
          podcastsData.length > 0 ||
          videosData.length > 0,
      };
    }
  };

  return useQuery({
    queryKey: ["getMoodTrackerRecommendations", moodType, language],
    queryFn: async () => await getMoodTrackerRecommendations(),
    enabled: !!moodType,
  });
};
