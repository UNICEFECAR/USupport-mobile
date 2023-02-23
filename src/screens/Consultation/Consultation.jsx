import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";

import {
  SendMessage,
  Message,
  SystemMessage,
  Screen,
  Loading,
  Backdrop,
} from "#components";

import {
  useGetChatData,
  useSendMessage,
  useLeaveConsultation,
  useGetSecurityCheckAnswersByConsultationId,
} from "#hooks";

import { VideoRoom } from "#blocks";
import { SafetyFeedback } from "../SafetyFeedback";
import { localStorage } from "#services";
import { showToast } from "#utils";
import { appStyles } from "#styles";

import { SOCKET_IO_URL } from "@env";

/**
 * Consultation
 *
 * Video - text consultation page
 *
 * @returns {JSX.Element}
 */
export const Consultation = ({ navigation, route }) => {
  const { t } = useTranslation("consultation-page");
  const navigate = navigation.navigate;
  const location = route.params;
  const backdropMessagesContainerRef = useRef();

  const consultation = location?.consultation;
  const joinWithVideo = location?.videoOn;
  const token = location?.token;

  if (!consultation || !token) return null;

  const { data: securityCheckAnswers } =
    useGetSecurityCheckAnswersByConsultationId(consultation.consultationId);

  const [isChatShown, setIsChatShown] = useState(!joinWithVideo);

  const [messages, setMessages] = useState([]);
  const [isSafetyFeedbackShown, setIsSafetyFeedbackShown] = useState(false);

  useEffect(() => {
    if (
      messages?.length > 0 &&
      backdropMessagesContainerRef.current &&
      backdropMessagesContainerRef.current.scrollHeight > 0
    ) {
      backdropMessagesContainerRef.current.scrollTo({
        top: backdropMessagesContainerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, backdropMessagesContainerRef.current?.scrollHeight]);

  // Mutations
  const onSendSuccess = (data) => {
    setMessages([...data.messages.reverse()]);
  };
  const onSendError = (err) => {
    showToast({ message: err, type: "error" });
  };
  const sendMessageMutation = useSendMessage(onSendSuccess, onSendError);
  const leaveConsultationMutation = useLeaveConsultation();

  const chatDataQuery = useGetChatData(consultation?.chatId, (data) =>
    setMessages(data.messages.reverse())
  );

  const clientId = chatDataQuery.data?.clientDetailId;

  const flatListRef = useRef();
  const socketRef = useRef();

  // TODO: Send a system message when the user joins the consultation
  // TODO: Send a consultation add services request only when the provider leaves the consultation
  // TODO: Send a system message when the client/provider toggles camera
  useEffect(() => {
    console.log(consultation.chatId, "chatId");
    localStorage.getItem("language").then((language) => {
      localStorage.getItem("country").then((country) => {
        socketRef.current = io(SOCKET_IO_URL, {
          path: "/api/v1/ws/socket.io",
          transports: ["websocket"],
          secure: true,
          rememberUpgrade: true,
        });
        socketRef.current?.emit("join chat", {
          country,
          language,
          chatId: consultation?.chatId,
          userType: "client",
        });
        socketRef.current?.on("receive message", receiveMessage);
      });
    });

    return () => {
      if (socketRef.current) {
        console.log("disconnect");
        socketRef.current.disconnect();
        socketRef.current.off();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const receiveMessage = (message) => {
    console.log("receive message");
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    setMessages((messages) => [message, ...messages]);
  };

  const handleSendMessage = async (content, type = "text") => {
    const language = await localStorage.getItem("language");
    const country = await localStorage.getItem("country");

    const message = {
      content,
      type,
      time: JSON.stringify(new Date().getTime()),
    };
    sendMessageMutation.mutate({
      message,
      chatId: consultation.chatId,
    });
    console.log("send", content);
    socketRef.current.emit("send message", {
      language,
      country,
      chatId: consultation.chatId,
      to: "provider",
      message,
    });
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const toggleChat = () => {
    if (!isChatShown) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      }, 200);
    }
    setIsChatShown(!isChatShown);
  };

  const leaveConsultation = async () => {
    const language = await localStorage.getItem("language");
    const country = await localStorage.getItem("country");

    leaveConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      userType: "client",
    });
    setIsSafetyFeedbackShown(true);
    const leaveMessage = {
      time: JSON.stringify(new Date().getTime()),
      content: t("client_left"),
      type: "system",
    };

    sendMessageMutation.mutate({
      chatId: consultation.chatId,
      message: leaveMessage,
    });

    socketRef.current.emit("send message", {
      language,
      country,
      chatId: consultation.chatId,
      to: "provider",
      message: leaveMessage,
    });
  };

  const renderMessage = (message) => {
    if (message.type === "system") {
      return (
        <SystemMessage
          key={message.time}
          title={message.content}
          date={new Date(Number(message.time))}
        />
      );
    } else {
      if (message.senderId === clientId) {
        return (
          <Message
            key={message.time}
            message={message.content}
            sent
            date={new Date(Number(message.time))}
          />
        );
      } else {
        return (
          <Message
            key={message.time}
            message={message.content}
            received
            date={new Date(Number(message.time))}
          />
        );
      }
    }
  };

  const sendJoinConsultationMessage = async () => {
    const language = await localStorage.getItem("language");
    const country = await localStorage.getItem("country");

    const joinMessage = {
      time: JSON.stringify(new Date().getTime()),
      content: t("client_joined"),
      type: "system",
    };

    sendMessageMutation.mutate({
      chatId: consultation.chatId,
      message: joinMessage,
    });

    socketRef.current.emit("send message", {
      language,
      country,
      chatId: consultation.chatId,
      to: "provider",
      message: joinMessage,
    });
  };

  return isSafetyFeedbackShown ? (
    <SafetyFeedback
      answers={securityCheckAnswers}
      consultationId={consultation.consultationId}
      navigation={navigation}
    />
  ) : (
    <View style={styles.container}>
      <View style={{ flexGrow: 1 }}>
        <VideoRoom
          joinWithVideo={joinWithVideo}
          consultation={consultation}
          toggleChat={toggleChat}
          leaveConsultation={leaveConsultation}
          handleSendMessage={handleSendMessage}
          sendJoinConsultationMessage={sendJoinConsultationMessage}
          token={token}
          navigation={navigation}
          t={t}
        />
      </View>

      <Backdrop
        // isOpen={true}
        isOpen={isChatShown}
        onClose={() => setIsChatShown(false)}
        customRender
        hasKeyboardListener
      >
        <View style={{ flex: 1, flexGrow: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : null}
            style={{
              flex: 1,
              // paddingBottom: 50,
            }}
            // keyboardVerticalOffset={64}
          >
            <FlatList
              inverted
              scrollEnabled
              data={chatDataQuery.isLoading ? [] : messages}
              keyExtractor={(item) => item.time.toString()}
              renderItem={({ item }) => renderMessage(item)}
              ref={flatListRef}
            />

            <View
              style={{
                justifyContent: "flex-end",
                paddingBottom: 20,
              }}
            >
              <SendMessage handleSubmit={handleSendMessage} t={t} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Backdrop>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: appStyles.colorGray_66768d,
    flex: 1,
    flexGrow: 1,
  },
});
