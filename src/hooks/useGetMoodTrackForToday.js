import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export function useGetMoodTrackForToday({ onSuccess }) {
  /**
   *
   * @returns
   */
  const getMoodTrackForToday = async () => {
    const { data } = await clientSvc.getMoodTrackForToday();
    const today = new Date();

    let todayMoodTrack = false;
    for (let i = 0; i < data.length; i++) {
      const moodTrackDate = new Date(data[i].time);
      if (today.toDateString() === moodTrackDate.toDateString()) {
        todayMoodTrack = data[i];
        break;
      }
    }

    return todayMoodTrack;
  };

  const getMoodTrackForTodayQuery = useQuery(
    ["getMoodTrackForToday"],
    getMoodTrackForToday,
    { onSuccess }
  );

  return getMoodTrackForTodayQuery;
}
