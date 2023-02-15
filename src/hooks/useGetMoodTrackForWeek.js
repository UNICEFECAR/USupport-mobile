import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useGetMoodTrackForWeek(startDate) {
  const getMoodTrackForWeek = async () => {
    const { data } = await clientSvc.getMoodTrackForWeek(startDate);

    return data.map((moodTrack) => {
      const date = new Date(moodTrack.time);
      return {
        ...moodTrack,
        time: date,
      };
    });
  };

  const getMoodTrackForWeekQuery = useQuery(
    ["getMoodTrackForWeek", startDate],
    getMoodTrackForWeek
  );

  return getMoodTrackForWeekQuery;
}
