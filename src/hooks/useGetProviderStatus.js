import { useQuery } from "@tanstack/react-query";

import { providerSvc } from "#services";

export default function useGetProviderStatus(providerId) {
  const fetchProviderStatus = async () => {
    const { data } = await providerSvc.getProviderStatusById(providerId);
    return data;
  };

  return useQuery(["provider-status", providerId], fetchProviderStatus, {
    enabled: !!providerId,
  });
}

export { useGetProviderStatus };
