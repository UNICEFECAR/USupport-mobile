import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";

import {
  AppButton,
  AppText,
  Backdrop,
  Icon,
  InputSearch,
  Message,
  SendMessage,
  SystemMessage,
  Toggle,
} from "#components";

import {
  useGetChatData,
  useSendMessage,
  useLeaveConsultation,
  useGetSecurityCheckAnswersByConsultationId,
  useDebounce,
  useGetAllChatHistoryData,
} from "#hooks";

import { VideoRoom } from "#blocks";
import { SafetyFeedback } from "../SafetyFeedback";
import { localStorage } from "#services";
import { showToast } from "#utils";
import { appStyles } from "#styles";

import Config from "react-native-config";
const { SOCKET_IO_URL } = Config;

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
  const joinWithMicrophone = location?.microphoneOn;
  const token = location?.token;

  if (!consultation || !token) return null;

  const { data: securityCheckAnswers } =
    useGetSecurityCheckAnswersByConsultationId(consultation.consultationId);

  const [isChatShown, setIsChatShown] = useState(!joinWithVideo);

  const [messages, setMessages] = useState([]);
  const [areSystemMessagesShown, setAreSystemMessagesShown] = useState(true);
  const [isSafetyFeedbackShown, setIsSafetyFeedbackShown] = useState(false);

  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState("");
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const chatDataQuery = useGetChatData(consultation?.chatId, (data) =>
    setMessages([...data.messages].reverse())
  );

  const clientId = chatDataQuery.data?.clientDetailId;
  const providerId = chatDataQuery.data?.providerDetailId;
  const allChatHistoryQuery = useGetAllChatHistoryData(
    providerId,
    clientId,
    showAllMessages
  );

  // Filter the messages based on the search input
  useEffect(() => {
    const messagesToFilter = showAllMessages
      ? allChatHistoryQuery.data?.messages
      : chatDataQuery.data?.messages;
    if (debouncedSearch) {
      const filteredMessages = messagesToFilter.filter((message) =>
        message.content.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setMessages([...filteredMessages].reverse());
    } else if (!debouncedSearch && chatDataQuery.data?.messages) {
      setMessages([...messagesToFilter].reverse());
    }
  }, [debouncedSearch]);

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

  useEffect(() => {
    if (showAllMessages && allChatHistoryQuery.data?.messages) {
      // let msgs = allChatHistoryQuery.data?.messages;
      // if (areSystemMessagesShown) {
      //   msgs = msgs.filter((x) => x.type !== "system");
      // }
      setMessages([...allChatHistoryQuery.data.messages].reverse());
    } else if (!showAllMessages) {
      let msgs = chatDataQuery.data?.messages || [];
      // if (areSystemMessagesShown) {
      //   msgs = msgs.filter((x) => x.type !== "system");
      // }
      setMessages([...msgs].reverse());
    }
  }, [showAllMessages, allChatHistoryQuery.data]);

  // Mutations
  const onSendSuccess = (data) => {
    setMessages([...data.messages.reverse()]);
  };
  const onSendError = (err) => {
    showToast({ message: err, type: "error" });
  };
  const sendMessageMutation = useSendMessage(onSendSuccess, onSendError);
  const leaveConsultationMutation = useLeaveConsultation();

  const flatListRef = useRef();
  const socketRef = useRef();

  // TODO: Send a consultation add services request only when the provider leaves the consultation
  useEffect(() => {
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
        socketRef.current.disconnect();
        socketRef.current.off();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const receiveMessage = (message) => {
    setHasUnreadMessages(true);
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    setMessages((messages) => [message, ...messages]);
  };

  const handleSendMessage = async (content, type = "text") => {
    if (hasUnreadMessages) {
      setHasUnreadMessages(false);
    }

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
    if (hasUnreadMessages) {
      setHasUnreadMessages(false);
    }
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

  const renderMessage = useCallback(
    (message) => {
      if (message.type === "system") {
        if (!areSystemMessagesShown) return null;
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
    },
    [messages, areSystemMessagesShown]
  );

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
          joinWithMicrophone={joinWithMicrophone}
          consultation={consultation}
          toggleChat={toggleChat}
          leaveConsultation={leaveConsultation}
          handleSendMessage={handleSendMessage}
          sendJoinConsultationMessage={sendJoinConsultationMessage}
          token={token}
          navigation={navigation}
          hasUnread={hasUnreadMessages}
          t={t}
        />
      </View>

      <Backdrop
        isOpen={isChatShown}
        onClose={() => {
          setIsChatShown(false);
          setHasUnreadMessages(false);
        }}
        customRender
        hasKeyboardListener
        style={{
          height: appStyles.screenHeight * 0.55,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            // height: 200,
            width: "100%",
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              hitSlop={styles.hitSlop}
              onPress={() => setIsChatShown(false)}
            >
              <Icon name="arrow-chevron-back" color="#000000" />
            </TouchableOpacity>
            <AppButton
              label={t(showOptions ? "hide_options" : "show_options")}
              size="sm"
              onPress={() => setShowOptions(!showOptions)}
            />
          </View>
          {showOptions ? (
            <View>
              <View style={styles.toggleContainer}>
                <Toggle
                  isToggled={areSystemMessagesShown}
                  handleToggle={() =>
                    setAreSystemMessagesShown(!areSystemMessagesShown)
                  }
                  style={styles.mr12}
                />
                <AppText>{t("show_system_messages")}</AppText>
              </View>
              <View style={styles.toggleContainer}>
                <Toggle
                  isToggled={showAllMessages}
                  handleToggle={() => setShowAllMessages(!showAllMessages)}
                  style={styles.mr12}
                />
                <AppText>{t("show_previous_consultations")}</AppText>
              </View>
              <InputSearch
                value={search}
                onChange={setSearch}
                style={{ marginTop: 12 }}
                placeholder={t("search")}
              />
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <KeyboardAvoidingView
            behavior={null}
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
              keyExtractor={(item, index) =>
                item.time.toString() + index.toString()
              }
              renderItem={({ item }) => renderMessage(item)}
              ref={flatListRef}
            />

            <View
              style={{
                justifyContent: "flex-end",
                paddingBottom: 20,
              }}
            >
              <SendMessage
                handleSubmit={handleSendMessage}
                t={t}
                hideOptions={() => setShowOptions(false)}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Backdrop>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: appStyles.colorBlack_37,
    flex: 1,
    flexGrow: 1,
  },
  closeIcon: { position: "absolute", right: 20, top: 20, zIndex: 999 },
  hitSlop: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  mr12: { marginRight: 12 },
});
