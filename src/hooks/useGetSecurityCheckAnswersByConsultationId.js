import { useQuery } from "@tanstack/react-query";
import { clientSvc } from "#services";

export const useGetSecurityCheckAnswersByConsultationId = (consultationId) => {
  const getSecurityCheckAnswers = async () => {
    const { data } = await clientSvc.getSecurityCheckAnswersByConsultationId(
      consultationId
    );
    return {
      contactsDisclosure: data.contacts_disclosure,
      suggestOutsideMeeting: data.suggest_outside_meeting,
      identityCoercion: data.identity_coercion,
      unsafeFeeling: data.unsafe_feeling,
      moreDetails: data.more_details,
    };
  };
  return useQuery(
    ["securityCheckAnswers", consultationId],
    getSecurityCheckAnswers,
    {
      enabled: !!consultationId,
    }
  );
};
