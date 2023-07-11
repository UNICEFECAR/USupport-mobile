import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { providerSvc } from "#services";

/**
 * Reuseable hook to get and transform the client data in a desired format
 */
export default function useGetProvidersData(activeCoupon = null) {
  const [providersData, setProvidersData] = useState();
  const fetchProvidersData = async () => {
    const { data } = await providerSvc.getAllProviders(
      activeCoupon?.campaignId
    );
    const formattedData = [];
    for (let i = 0; i < data.length; i++) {
      const providerData = data[i];
      const formattedProvider = {
        providerDetailId: providerData.provider_detail_id || "",
        name: providerData.name || "",
        patronym: providerData.patronym || "",
        surname: providerData.surname || "",
        nickname: providerData.nickname || "",
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
        couponPrice: providerData.price_per_coupon || 0,
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
    ["all-providers-data", activeCoupon],
    fetchProvidersData,
    {
      onSuccess: (data) => {
        const dataCopy = JSON.parse(JSON.stringify(data));
        setProvidersData([...dataCopy]);
      },
      notifyOnChangeProps: ["data"],
      enabled: activeCoupon === null ? true : !!activeCoupon,
    }
  );

  return [providersDataQuery, providersData, setProvidersData];
}

export { useGetProvidersData };
