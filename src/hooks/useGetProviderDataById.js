import { useQuery, useQueryClient } from "@tanstack/react-query";
import { providerSvc } from "#services";

/**
 * Reuseable hook to get and transform the provider data in a desired format
 */
export default function useGetProviderDataById(id, campaignId) {
  const fetchProvidersData = async () => {
    let data;

    const response = await providerSvc.getProviderById(id, campaignId);
    data = response.data;

    const formattedData = {
      providerDetailId: data.provider_detail_id || "",
      name: data.name || "",
      patronym: data.patronym || "",
      surname: data.surname || "",
      nickname: data.nickname || "",
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
      videoLink: data.video_link || "",
      videoId: "",
    };

    if (formattedData.videoLink) {
      if (formattedData.videoLink.startsWith("https://youtu.be")) {
        formattedData.videoId = formattedData.videoLink.split("/")[3];
      } else {
        formattedData.videoId = formattedData.videoLink.split("=")[1];
      }
    }

    return formattedData;
  };

  const providersDataQuery = useQuery(
    ["provider-data", id],
    fetchProvidersData,
    {
      enabled: !!id,
      notifyOnChangeProps: ["data"],
      refetchOnWindowFocus: true,
    }
  );

  return providersDataQuery;
}

export { useGetProviderDataById };
