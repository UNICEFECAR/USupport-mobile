import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Joi from "joi";

import { TransparentModal, Dropdown, Textarea, Input } from "#components";
import { useSendIssueEmail } from "#hooks";
import { validate, showToast } from "#utils";

const TECHNICAL_PROBLEM_VALUE = "technical-problem";

export function ReportIssue({ isOpen, onClose, initialEmail = "" }) {
  const { t } = useTranslation("blocks", { keyPrefix: "contact-us-block" });

  const [data, setData] = useState({
    email: initialEmail,
    issue: TECHNICAL_PROBLEM_VALUE,
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const technicalProblemOptions = useMemo(
    () => [
      {
        label: t("technical_problem_label"),
        value: TECHNICAL_PROBLEM_VALUE,
        selected: true,
      },
    ],
    [t],
  );

  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
    issue: Joi.string().label(t("issue_error")),
    message: Joi.string().min(5).label(t("message_error")),
  });

  useEffect(() => {
    if (isOpen) {
      setData({
        email: initialEmail ?? "",
        issue: TECHNICAL_PROBLEM_VALUE,
        message: "",
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [isOpen, initialEmail]);

  const onSendEmailSuccess = () => {
    showToast({ message: t("success") });
    onClose?.();
  };

  const onSendEmailError = (errorMessage) => setSubmitError(errorMessage);

  const sendIssueEmailMutation = useSendIssueEmail(
    onSendEmailSuccess,
    onSendEmailError,
  );

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (sendIssueEmailMutation.isLoading) return;

    const dataToValidate = {
      email: data.email,
      issue: data.issue,
      message: data.message,
    };

    if ((await validate(dataToValidate, schema, setErrors)) === null) {
      const payload = {
        subjectValue: TECHNICAL_PROBLEM_VALUE,
        subjectLabel: t("technical_problem_label"),
        title: technicalProblemOptions[0].label,
        text: data.message,
        email: data.email.toLowerCase(),
      };
      sendIssueEmailMutation.mutate(payload);
    }
  };

  return (
    <TransparentModal
      isOpen={isOpen}
      handleClose={onClose}
      heading={t("issue")}
      text={t("report_issue_intro")}
      ctaLabel={t("button")}
      ctaHandleClick={handleSubmit}
      isCtaLoading={sendIssueEmailMutation.isLoading}
      isCtaDisabled={sendIssueEmailMutation.isLoading}
      secondaryCtaLabel={t("close_button_label")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaType="ghost"
      errorMessage={submitError}
      scrollableBody
    >
      <View style={styles.form}>
        <Input
          label={t("email")}
          value={data.email}
          onChange={(value) => handleChange("email", value)}
          errorMessage={errors.email}
          style={styles.input}
          placeholder="name@mail.com"
        />
        <Dropdown
          label={t("issue")}
          style={styles.dropdown}
          options={technicalProblemOptions}
          selected={data.issue}
          setSelected={() => {}}
          disabled
          dropdownId="report-issue-reason"
        />
        <Textarea
          label={t("message")}
          style={styles.textarea}
          errorMessage={errors.message}
          onChange={(value) => handleChange("message", value)}
          value={data.message}
          placeholder={t("message_placeholder")}
        />
      </View>
    </TransparentModal>
  );
}

ReportIssue.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialEmail: PropTypes.string,
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  dropdown: {
    marginBottom: 16,
    zIndex: 3,
  },
  textarea: {
    marginBottom: 8,
  },
});
