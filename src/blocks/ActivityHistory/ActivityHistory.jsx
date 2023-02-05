import React from "react";
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
} from "#components";
import { appStyles } from "#styles";
import { useGetChatData } from "#hooks";
import { AMAZON_S3_BUCKET } from "@env";

export const ActivityHistory = ({
  navigation,
  openSelectConsultation,
  consultation,
  providerId,
}) => {
  const { t } = useTranslation("activity-history");

  const chatQueryData = useGetChatData(consultation?.chatId);

  const imageUri = AMAZON_S3_BUCKET + "/" + (consultation.image || "default");

  const renderAllMessages = () => {
    return chatQueryData.data?.messages.map((message, index) => {
      if (message.type === "system") {
        return (
          <SystemMessage
            key={index + message.time}
            title={message.content}
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
  };

  const handleSchedule = () => {
    openSelectConsultation();
  };

  return (
    <>
      <Block>
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
      </Block>
      <Block classes="activity-history__main">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="activity-history__main__content">
            <View style={styles.messagesContainer}>{renderAllMessages()}</View>
          </View>
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
  container: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 100, marginHorizontal: 16 },
  messagesContainer: {
    flexDirection: "column",
    flex: 1,
    width: "100%",
    paddingBottom: 100,
  },
  message: { marginVertical: 8 },
  buttonContainer: {
    width: "100%",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    alignItems: "center",
  },
});
