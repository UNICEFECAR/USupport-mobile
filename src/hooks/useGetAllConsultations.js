import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export default function useGetAllConsultations(enabled = true) {
  const getAllConsultations = async () => {
    const response = await clientSvc.getAllConsultations();
    const data = response.data;
    const formattedData = [];
    for (let i = 0; i < data?.length; i++) {
      const consultation = data[i];
      formattedData.push({
        chatId: consultation.chat_id,
        consultationId: consultation.consultation_id,
        clientDetailId: consultation.client_detail_id,
        providerId: consultation.provider_detail_id,
        providerName: consultation.provider_name,
        image: consultation.provider_image,
        timestamp: new Date(consultation.time).getTime(),
        status: consultation.status,
        price: consultation.price,
      });
    }
    return formattedData;
  };

  const getAllConsultationsQuery = useQuery(
    ["all-consultations"],
    getAllConsultations,
    { enabled: !!enabled }
  );

  return getAllConsultationsQuery;
}

export { useGetAllConsultations };
