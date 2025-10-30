import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export default function useGetHasCompletedMoodTrackerEver(enabled) {
  const getHasCompletedMoodTrackerEver = async () => {
    const { data } = await clientSvc.getHasCompletedMoodTrackerEver();
    return data.hasCompleted;
  };

  const getHasCompletedMoodTrackerEverQuery = useQuery({
    queryKey: ["getHasCompletedMoodTrackerEver"],
    queryFn: getHasCompletedMoodTrackerEver,
    enabled: !!enabled,
    initialData: true,
  });

  return getHasCompletedMoodTrackerEverQuery;
}

export { useGetHasCompletedMoodTrackerEver };
