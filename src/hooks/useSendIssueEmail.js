import { useMutation } from "@tanstack/react-query";
import { emailSvc } from "#services";
import { useError } from "./useError";

export default function useSendIssueEmail(onSuccess, onError) {
  /**
   *
   * @param {Object} payload with fields "subject", "title" and "text"
   * @returns {Promise}
   */
  const sendIssueEmail = async (payload) => {
    const res = await emailSvc.sendAdmin(payload);
    return res;
  };

  const sendIssueEmailMutation = useMutation(sendIssueEmail, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return sendIssueEmailMutation;
}

export { useSendIssueEmail };
