import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { providerSvc } from "#services";

/**
 * Reuseable hook to get and transform the client data in a desired format
 */
export default function useGetProvidersData() {
  //   const queryClient = useQueryClient();
  const [providersData, setProvidersData] = useState();
  const fetchProvidersData = async () => {
    const { data } = await providerSvc.getAllProviders();
    const formattedData = [];
    for (let i = 0; i < data.length; i++) {
      const providerData = data[i];
      const formattedProvider = {
        providerDetailId: providerData.provider_detail_id || "",
        name: providerData.name || "",
        patronym: providerData.patronym || "",
        surname: providerData.surname || "",
        nickname: providerData.nickname || "",
        email: providerData.email || "",
        phonePrefix: providerData.phone_prefix || "",
        phone: providerData.phone || "",
        image: providerData.image || "default",
        specializations: providerData.specializations || [],
        education: providerData.education || [],
        sex: providerData.sex || "",
        consultationPrice: providerData.consultation_price || 0,
        description: providerData.description || "",
        languages: providerData.languages || [],
        workWith: providerData.work_with || [],
        totalConsultations: providerData.total_consultations || 0,
        earliestAvailableSlot: providerData.earliest_available_slot || "",
      };
      formattedData.push(formattedProvider);
    }
    // Return only the providers that have available slot
    return formattedData
      .filter((x) => x.earliestAvailableSlot)
      .sort((a, b) => {
        return (
          new Date(a.earliestAvailableSlot) - new Date(b.earliestAvailableSlot)
        );
      });
  };

  const providersDataQuery = useQuery(
    ["all-providers-data"],
    fetchProvidersData,
    {
      onSuccess: (data) => {
        const dataCopy = JSON.parse(JSON.stringify(data));
        setProvidersData([...dataCopy]);
      },
      notifyOnChangeProps: ["data"],
    }
  );

  return [providersDataQuery, providersData, setProvidersData];
}

export { useGetProvidersData };
