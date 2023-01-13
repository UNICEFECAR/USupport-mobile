import { useQuery, useQueryClient } from "@tanstack/react-query";
import { providerSvc } from "#services";

/**
 * Reuseable hook to get and transform the provider data in a desired format
 */
export default function useGetProviderDataById(id) {
  //   const queryClient = useQueryClient();
  const fetchProvidersData = async () => {
    let data;

    const response = await providerSvc.getProviderById(id);
    data = response.data;

    const formattedData = {
      providerDetailId: data.provider_detail_id || "",
      name: data.name || "",
      patronym: data.patronym || "",
      surname: data.surname || "",
      nickname: data.nickname || "",
      email: data.email || "",
      phonePrefix: data.phone_prefix || "",
      phone: data.phone || "",
      image: data.image || "default",
      specializations: data.specializations || [],
      education: data.education || [],
      sex: data.sex || "",
      consultationPrice: data.consultation_price || 0,
      description: data.description || "",
      languages: data.languages || [],
      workWith: data.work_with || [],
      totalConsultations: data.total_consultations || 0,
      earliestAvailableSlot: data.earliest_available_slot || "",
    };
    return formattedData;
  };

  const providersDataQuery = useQuery(
    ["provider-data", id],
    fetchProvidersData,
    {
      enabled: !!id,
      notifyOnChangeProps: ["data"],
    }
  );

  return providersDataQuery;
}

export { useGetProviderDataById };
