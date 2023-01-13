import { useQuery } from "@tanstack/react-query";

export default function useGetConsultationData(consultationId) {
  const placeholderData = {
    providerName: "Dr. John Doe",
    providerPicture: "https://i.pravatar.cc/150?img=1",
    messages: [
      {
        type: "system-message",
        message: "Consultation started",
        date: 1669051768000,
      },
      {
        type: "message",
        senderId: "1",
        receiverId: "2",
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
        date: 1669051948000,
      },
      {
        type: "message",
        senderId: "2",
        receiverId: "1",
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
        date: new Date("10.25.2022 14:35"),
      },
      {
        type: "message",
        senderId: "1",
        receiverId: "2",
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
        date: 1669052128000,
      },
      {
        type: "message",
        senderId: "2",
        receiverId: "1",
        message: "yes.",
        date: 1669052428000,
      },
      {
        type: "message",
        senderId: "1",
        receiverId: "2",
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
        date: 1669052668000,
      },
      {
        type: "message",
        senderId: "2",
        receiverId: "1",
        message:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra mattis lectus turpis mauris odio vestibulum urna.",
        date: 1669052788000,
      },
      {
        type: "system-message",
        message: "Consultation ended",
        date: 1669052988000,
      },
    ],
  };
  const getConsultationData = async (consultationId) => {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return placeholderData;
  };

  const consultationQuery = useQuery(
    ["consultation-data", consultationId],
    getConsultationData,
    {
      enabled: !!consultationId,
    }
  );

  return consultationQuery;
}

export { useGetConsultationData };
