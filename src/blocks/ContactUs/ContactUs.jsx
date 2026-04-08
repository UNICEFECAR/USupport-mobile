import "fast-text-encoding";
import Joi from "joi";
import React, { useState, useEffect, useContext } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";

import { Block, Heading, Dropdown, Textarea, NewButton } from "#components";

import { useSendIssueEmail, useGetClientData } from "#hooks";

import { Context } from "#services";

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
  const { t } = useTranslation("blocks", { keyPrefix: "contact-us-block" });
  const [data, setData] = useState({ ...initialData });

  const { country, isTmpUser } = useContext(Context);

  const IS_PL = country === "PL";

  const [issues, setIssues] = useState([
    {
      label: t(IS_PL ? "contact_reason_1_pl" : "contact_reason_1"),
      value: "information",
      selected: false,
    },
    {
      label: t(IS_PL ? "contact_reason_2_pl" : "contact_reason_2"),
      value: "services-information",
      selected: false,
    },
    {
      label: t(IS_PL ? "contact_reason_3_pl" : "contact_reason_3"),
      value: "technical_problem",
      selected: false,
    },
    {
      label: t(IS_PL ? "contact_reason_4_pl" : "contact_reason_4"),
      value: "other",
      selected: false,
    },
  ]);
  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [clientDataQuery] = useGetClientData(!isTmpUser);

  const clientData = clientDataQuery?.data;
  const email = clientData?.email || "";

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
          subjectValue: data.issue,
          subjectLabel: t("contact_form"),
          title: issues.find((x) => x.value === data.issue)?.label,
          text: data.message,
          email,
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
      <ScrollView
        contentContainerStyle={styles.flexGrow}
        keyboardShouldPersistTaps="never"
      >
        <Block style={styles.block}>
          <Heading
            heading={t("heading")}
            subheading={t("subheading")}
            handleGoBack={handleGoBack}
          />
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
            <NewButton
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
  block: { flex: 1, flexGrow: 1 },
  flexGrow: { flexGrow: 1 },
  dropdown: { marginTop: 32, zIndex: 3 },
  textarea: { marginTop: 22 },
  button: { marginTop: 32, marginBottom: 75 },
});
