import "fast-text-encoding";
import Joi from "joi";
import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Block, Heading, Dropdown, Textarea, AppButton } from "#components";

import { useSendIssueEmail } from "#hooks";

import { validate, showToast } from "#utils";

const initialData = {
  issue: null,
  message: "",
};

/**
 * ContactUs
 *
 * Contact us form block
 *
 * @return {jsx}
 */
export const ContactUs = ({ navigation }) => {
  // const navigate = useNavigate();
  const { t } = useTranslation("contact-us-block");
  const [data, setData] = useState({ ...initialData });
  const [issues, setIssues] = useState([
    { label: t("contact_reason_1"), value: "reason-1", selected: false },
    { label: t("contact_reason_2"), value: "reason-2", selected: false },
    { label: t("contact_reason_3"), value: "reason-3", selected: false },
    { label: t("contact_reason_4"), value: "reason-4", selected: false },
  ]);
  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const schema = Joi.object({
    issue: Joi.string().label(t("issue_error")),
    message: Joi.string().min(5).label(t("message_error")),
  });

  useEffect(() => {
    if (data.message !== "" && data.issue) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [data]);

  // const handleModalSuccessCtaClick = () => {
  //   navigate("/dashboard");
  // };

  // const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleIssueChange = (issue) => {
    const issuesCopy = [...issues];
    for (let i = 0; i < issuesCopy.length; i++) {
      if (issuesCopy[i].value === issue) {
        issuesCopy[i].selected = true;
      } else {
        issuesCopy[i].selected = false;
      }
    }
    setIssues(issuesCopy);
    setData({
      ...data,
      issue,
    });
  };

  const onSendEmailSuccess = () => {
    setIsSuccessModalOpen(true);
    setData({ ...initialData });
    showToast({
      message: t("success"),
    });
  };
  const onSendEmailError = (error) => {
    setErrors({ submit: error });
  };
  const sendIssueEmailMutation = useSendIssueEmail(
    onSendEmailSuccess,
    onSendEmailError
  );

  const handleSubmit = async () => {
    if (!sendIssueEmailMutation.isLoading) {
      const dataToValidate = {
        issue: data.issue,
        message: data.message,
      };
      if ((await validate(dataToValidate, schema, setErrors)) === null) {
        const payload = {
          subject: "Technical issue",
          title: issues.find((x) => x.value === data.issue)?.label,
          text: data.message,
        };
        sendIssueEmailMutation.mutate(payload);
      }
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flexGrow}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        handleGoBack={handleGoBack}
      />
      <ScrollView
        contentContainerStyle={[styles.flexGrow, { marginTop: 84 }]}
        keyboardShouldPersistTaps="never"
      >
        <Block style={styles.block}>
          <Dropdown
            label={t("issue")}
            style={styles.dropdown}
            options={issues}
            selected={data.issue}
            setSelected={handleIssueChange}
            errorMessage={errors.issue}
            placeholder={t("issue_placeholder")}
            dropdownId="issues"
          />
          <Textarea
            label={t("message")}
            style={styles.textarea}
            errorMessage={errors.message}
            onChange={(value) => handleChange("message", value)}
            value={data.message}
            placeholder={t("message_placeholder")}
          />
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <AppButton
              size="lg"
              label={t("button")}
              style={styles.button}
              disabled={!canSubmit}
              loading={sendIssueEmailMutation.isLoading}
              onPress={handleSubmit}
            />
          </View>
        </Block>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  block: { alignItems: "center", flex: 1, flexGrow: 1 },
  flexGrow: { flexGrow: 1 },
  dropdown: { marginTop: 32, zIndex: 3 },
  textarea: { marginTop: 22 },
  button: { marginTop: 32, marginBottom: 75 },
});
