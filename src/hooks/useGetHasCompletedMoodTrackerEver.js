import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export default function useGetHasCompletedMoodTrackerEver(enabled) {
  const getHasCompletedMoodTrackerEver = async () => {
    const { data } = await clientSvc.getHasCompletedMoodTrackerEver();
    console.log("Returned data: ", data);
    console.log("Returned data.hasCompleted: ", data.hasCompleted);
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
