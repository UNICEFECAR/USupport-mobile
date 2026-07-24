import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export default function useCheckActiveCampaign(enabled) {
  const checkActiveCampaign = async () => {
    const { data } = await clientSvc.checkActiveCampaign();
    return data?.hasActiveCampaign ?? false;
  };

  return useQuery({
    queryKey: ["check-active-campaign"],
    queryFn: checkActiveCampaign,
    enabled: !!enabled,
  });
}

export { useCheckActiveCampaign };
