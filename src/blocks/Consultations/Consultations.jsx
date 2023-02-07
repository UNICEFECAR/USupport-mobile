import Reac, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Block, TabsUnderlined, Consultation, AppText } from "#components";

import { ONE_HOUR } from "#utils";

import {
  useGetAllConsultations,
  useAcceptConsultation,
  useRejectConsultation,
} from "#hooks";

/**
 * Consultations
 *
 * Consultations block
 *
 * @return {jsx}
 */
export const Consultations = ({
  openEditConsultation,
  openJoinConsultation,
  navigation,
}) => {
  const { t } = useTranslation("consultations");

  const [tabsOptions, setTabsOptions] = useState([
    { label: t("upcoming_tab_label"), value: "upcoming", isSelected: true },
    {
      label: t("past_tab_label"),
      value: "past",
      isSelected: false,
    },
  ]);

  const [filter, setFilter] = useState("upcoming");

  const daysOfWeekTranslations = {
    monday: t("monday"),
    tuesday: t("tuesday"),
    wednesday: t("wednesday"),
    thursday: t("thursday"),
    friday: t("friday"),
    saturday: t("saturday"),
    sunday: t("sunday"),
  };

  const consultationsQuery = useGetAllConsultations();
  const handleTabClick = (index) => {
    const optionsCopy = [...tabsOptions];

    for (let i = 0; i < optionsCopy.length; i++) {
      if (i === index) {
        optionsCopy[i].isSelected = true;
      } else {
        optionsCopy[i].isSelected = false;
      }
    }

    setTabsOptions(optionsCopy);
    setFilter(optionsCopy[index].value);
  };

  const handleOpenEdit = (consultation) => {
    openEditConsultation(consultation);
  };

  const handleOpenDetails = (consultation) => {
    navigation.navigate("ActivityHistory", {
      providerId: consultation.providerId,
      consultation: consultation,
    });
  };

  const onAcceptConsultationSuccess = () => {
    toast(t("accept_consultation_success"));
  };
  const onAcceptConsultationError = (error) => {
    toast(error, { type: "error" });
  };
  const acceptConsultationMutation = useAcceptConsultation(
    onAcceptConsultationSuccess,
    onAcceptConsultationError
  );
  const acceptConsultation = (consultationId, price) => {
    acceptConsultationMutation.mutate({ consultationId, price });
  };

  const onRejectConsultationSuccess = () => {
    toast(t("reject_consultation_success"));
  };
  const onRejectConsultationError = (error) => {
    toast(error, { type: "error" });
  };
  const rejectConsultationMutation = useRejectConsultation(
    onRejectConsultationSuccess,
    onRejectConsultationError
  );
  const rejectConsultation = (consultationId) => {
    rejectConsultationMutation.mutate(consultationId);
  };

  const filterConsultations = useCallback(() => {
    const currentDateTs = new Date().getTime();

    return consultationsQuery.data
      ?.filter((consultation) => {
        const endTime = consultation.timestamp + ONE_HOUR;
        if (filter === "upcoming") {
          return (
            consultation.timestamp >= currentDateTs ||
            (currentDateTs >= consultation.timestamp &&
              currentDateTs <= endTime)
          );
        } else {
          return endTime < currentDateTs;
        }
      })
      .sort((a, b) => {
        if (filter === "upcoming") {
          return a.timestamp - b.timestamp;
        } else {
          return b.timestamp - a.timestamp;
        }
      });
  }, [consultationsQuery.data, filter]);

  const renderAllConsultations = useMemo(() => {
    const filteredConsultations = filterConsultations();

    if (filteredConsultations?.length === 0)
      return (
        <AppText>
          {t(
            filter === "upcoming"
              ? "no_upcoming_consultations"
              : "no_past_consultations"
          )}
        </AppText>
      );
    return filteredConsultations?.map((consultation, index) => {
      const hasMoreThanOne = filteredConsultations.length > 1;
      return (
        <Consultation
          renderIn="client"
          handleOpenEdit={handleOpenEdit}
          handleJoinClick={openJoinConsultation}
          handleOpenDetails={handleOpenDetails}
          daysOfWeekTranslations={daysOfWeekTranslations}
          consultation={consultation}
          overview={false}
          suggested={consultation.status === "suggested" ? true : false}
          handleAcceptConsultation={acceptConsultation}
          handleRejectConsultation={rejectConsultation}
          key={consultation.consultationId}
          t={t}
          style={styles.consultation}
        />
      );
    });
  }, [consultationsQuery.data, filter]);

  return (
    <Block>
      <TabsUnderlined
        options={tabsOptions}
        handleSelect={handleTabClick}
        style={styles.tabs}
      />
      <View style={styles.consultationsContainer}>
        {renderAllConsultations}
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  consultationsContainer: { alignItems: "center", paddingBottom: 60 },
  consultation: { marginBottom: 16 },
  tabs: { marginBottom: 32 },
});
