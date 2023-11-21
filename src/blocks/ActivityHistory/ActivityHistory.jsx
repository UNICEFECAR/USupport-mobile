import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";

import {
  Block,
  Icon,
  AppText,
  Avatar,
  Message,
  SystemMessage,
  AppButton,
  Toggle,
  InputSearch,
  Loading,
} from "#components";
import { appStyles } from "#styles";
import { useGetChatData, useGetAllChatHistoryData, useDebounce } from "#hooks";
import { systemMessageTypes } from "#utils";

import Config from "react-native-config";
import { useGetTheme } from "#hooks";
const { AMAZON_S3_BUCKET } = Config;

export const ActivityHistory = ({
  navigation,
  openSelectConsultation,
  consultation,
  providerId,
}) => {
  const { t } = useTranslation("activity-history");
  const { colors } = useGetTheme();

  const [shownMessages, setShownMessages] = useState();
  const messagesContainerRef = useRef();

  const [showSystemMessages, setShowSystemMessages] = useState(true);
  const [showAllConsultations, setShowAllConsultations] = useState(false);
  const [search, setSearch] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const chatQueryData = useGetChatData(consultation?.chatId);
  const allChatHistoryQuery = useGetAllChatHistoryData(
    providerId,
    chatQueryData.data?.clientDetailId,
    showAllConsultations
  );

  const debouncedSearch = useDebounce(search, 500);
  // Set the initial messages
  useEffect(() => {
    if (!shownMessages && chatQueryData.data) {
      setShownMessages(chatQueryData.data.messages);
    }
  }, [chatQueryData.data]);

  useEffect(() => {
    if (shownMessages) {
      if (
        showAllConsultations &&
        showSystemMessages &&
        allChatHistoryQuery.data
      ) {
        setShownMessages(allChatHistoryQuery.data?.messages);
      } else if (
        showAllConsultations &&
        !showSystemMessages &&
        allChatHistoryQuery.data
      ) {
        setShownMessages(allChatHistoryQuery.data?.nonSystemMessages);
      } else if (!showAllConsultations && showSystemMessages) {
        setShownMessages(chatQueryData.data?.messages);
      } else if (!showAllConsultations && !showSystemMessages) {
        setShownMessages(chatQueryData.data?.nonSystemMessages);
      }
      setIsFiltering(false);
    }
  }, [
    showAllConsultations,
    showSystemMessages,
    allChatHistoryQuery.data,
    chatQueryData.data,
  ]);

  useEffect(() => {
    if (shownMessages?.length) {
      setTimeout(() => {
        messagesContainerRef.current?.scrollToEnd();
      }, 200);
    }
  }, [shownMessages, isFiltering]);

  const imageUri = AMAZON_S3_BUCKET + "/" + (consultation.image || "default");
  const renderAllMessages = useCallback(() => {
    return shownMessages?.map((message, index) => {
      if (
        debouncedSearch &&
        !message.content.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return null;
      }
      if (message.type === "system") {
        if (!showSystemMessages) {
          return null;
        }
        return (
          <SystemMessage
            key={index + message.time}
            title={
              systemMessageTypes.includes(message.content)
                ? t(message.content)
                : message.content
            }
            date={new Date(Number(message.time))}
            style={styles.message}
          />
        );
      } else {
        if (message.senderId !== providerId) {
          return (
            <Message
              key={index + message.time}
              message={message.content}
              sent
              date={new Date(Number(message.time))}
              style={styles.message}
            />
          );
        } else {
          return (
            <Message
              key={index + message.time}
              message={message.content}
              received
              date={new Date(Number(message.time))}
              style={styles.message}
            />
          );
        }
      }
    });
  }, [shownMessages, debouncedSearch, showSystemMessages, providerId]);

  const handleSchedule = () => {
    openSelectConsultation();
  };
  return (
    <>
      <Block style={[styles.block, { backgroundColor: colors.background }]}>
        <View style={[styles.container]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-chevron-back"
              color={appStyles.colorPrimary_20809e}
            />
          </TouchableOpacity>
          <Avatar style={styles.avatar} image={{ uri: imageUri }} />
          <AppText namedStyle="h3">{consultation.providerName}</AppText>
        </View>
        <InputSearch
          value={search}
          onChange={setSearch}
          style={{
            marginTop: 12,
            alignSelf: "flex-start",
            width: appStyles.screenWidth * 0.9,
          }}
          placeholder={t("search")}
        />
        <View style={styles.toggleContainer}>
          <Toggle
            isToggled={showSystemMessages}
            handleToggle={() => setShowSystemMessages(!showSystemMessages)}
            style={{ marginRight: 12 }}
          />
          <AppText>{t("show_system_messages")}</AppText>
        </View>

        <View style={styles.toggleContainer}>
          <Toggle
            isToggled={showAllConsultations}
            handleToggle={() => setShowAllConsultations(!showAllConsultations)}
            style={{ marginRight: 12 }}
          />
          <AppText>{t("show_previous_consultations")}</AppText>
        </View>
      </Block>

      <Block style={{ marginTop: "28%", flex: 1 }}>
        <ScrollView
          ref={messagesContainerRef}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: "28%" }} />
          <View>
            {!shownMessages && chatQueryData.isLoading ? (
              <View
                style={{
                  alignItems: "center",
                  paddingTop: 50,
                }}
              >
                <Loading size="lg" />
              </View>
            ) : (
              renderAllMessages()
            )}
          </View>
          <View style={{ paddingBottom: 100 }} />
        </ScrollView>
        <View style={styles.buttonContainer}>
          <AppButton
            label={t("button_label")}
            size="lg"
            onPress={handleSchedule}
          />
        </View>
      </Block>
    </>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    height: "28%",
    backgroundColor: "white",
    zIndex: 1,
  },
  container: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 100, marginHorizontal: 16 },
  messagesContainer: {
    flexDirection: "column",
    flex: 1,
    width: "100%",
  },
  message: { marginVertical: 8 },
  buttonContainer: {
    width: "100%",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 10,
  },
  toggleContainer: {
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    marginTop: 12,
  },
});
