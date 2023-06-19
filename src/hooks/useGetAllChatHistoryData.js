import { useQuery } from "@tanstack/react-query";

import { messageSvc } from "#services";

export default function useGetAllChatHistoryData(
  providerDetailId,
  clientDetailId,
  enabled
) {
  const fetchChatData = async () => {
    const { data } = await messageSvc.getAllChatData(
      providerDetailId,
      clientDetailId
    );
    const formattedData = {
      chatId: data.chat_id,
      clientDetailId: data.client_detail_id,
      providerDetailId: data.provider_detail_id,
      messages: data.messages || [],
    };
    const nonSystemMessages = formattedData.messages.filter(
      (x) => x.type !== "system"
    );
    return {
      ...formattedData,
      nonSystemMessages,
    };
  };
  const query = useQuery(
    ["all-chat-data", providerDetailId, clientDetailId],
    fetchChatData,
    {
      enabled: !!enabled && !!providerDetailId && !!clientDetailId,
      onError: console.log,
    }
  );

  return query;
}

export { useGetAllChatHistoryData };
