import { useMutation, useQueryClient } from "@tanstack/react-query";
import { providerSvc } from "#services";
import { useError } from "./useError";
import { useNavigation } from "@react-navigation/native";

export default function useAcceptConsultation(onSuccess, onError) {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const acceptConsultation = async ({ consultationId, price, slot }) => {
    if (price && price > 0) {
      navigation.navigate("Checkout", {
        consultationId,
        price,
        selectedSlot: slot,
      });
      return false;
    } else {
      const res = await providerSvc.acceptConsultation(consultationId);
      return res;
    }
  };
  const acceptConsultationMutation = useMutation(acceptConsultation, {
    onSuccess: (data) => {
      if (data) {
        onSuccess();
        queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
      }
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });
  return acceptConsultationMutation;
}

export { useAcceptConsultation };
