import { useMutation } from "@tanstack/react-query";
import { emailSvc, userSvc } from "#services";
import { useError } from "./useError";

export default function useSendIssueEmail(onSuccess, onError) {
  /**
   *
   * @param {Object} payload with fields "subject", "title" and "text"
   * @returns {Promise}
   */
  const sendIssueEmail = async (payload) => {
    const emailPromise = emailSvc.sendAdmin({
      subject: payload.subjectLabel,
      title: payload.title,
      text: payload.text,
      email: payload.email,
    });

    const addFormPromise = userSvc.addContactForm({
      subject: payload.subjectValue,
      email: payload.email,
      message: payload.text,
      sentFrom: "client",
    });

    await Promise.all([emailPromise, addFormPromise]);

    return true;
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
