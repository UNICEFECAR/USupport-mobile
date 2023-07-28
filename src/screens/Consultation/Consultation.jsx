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
  TypingIndicator,
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
import { showToast, ONE_HOUR } from "#utils";
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

  const [messages, setMessages] = useState({
    currentSession: [],
    previousSessions: [],
  });
  const [displayedMessages, setDisplayedMessages] = useState([]);

  const [areSystemMessagesShown, setAreSystemMessagesShown] = useState(true);
  const [isSafetyFeedbackShown, setIsSafetyFeedbackShown] = useState(false);

  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [search, setSearch] = useState("");
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isProviderInSession, setIsProviderInSession] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const checkHasProviderJoined = (messages) => {
    // Sort the messages by time descending so the latest messages are first
    // Then check which one of the following two cases is true:
    const joinMessages = messages
      .filter(
        (x) => x.content === "provider_joined" || x.content === "provider_left"
      )
      .sort((a, b) => new Date(Number(b.time)) - new Date(Number(a.time)));
    return joinMessages[0].content === "provider_joined";
  };

  const chatDataQuery = useGetChatData(consultation?.chatId, (data) => {
    setIsProviderInSession(checkHasProviderJoined(data.messages));
    setMessages((prev) => ({
      ...prev,
      currentSession: data.messages,
    }));
  });

  const clientId = chatDataQuery.data?.clientDetailId;
  const providerId = chatDataQuery.data?.providerDetailId;
  const allChatHistoryQuery = useGetAllChatHistoryData(
    providerId,
    clientId,
    true
  );

  useEffect(() => {
    const endTime = new Date(consultation.timestamp + ONE_HOUR);
    let isTenMinAlertShown,
      isFiveMinAlertShown = false;

    const interval = setInterval(() => {
      const now = new Date();
      const timeDifferenceInMinutes = Math.floor((endTime - now) / (1000 * 60));

      if (timeDifferenceInMinutes <= 10 && !isTenMinAlertShown) {
        showToast({
          message: t("consultation_end_reminder", { minutes: 10 }),
          autoHide: false,
          type: "info",
        });
        isTenMinAlertShown = true;
      }
      if (timeDifferenceInMinutes <= 5 && !isFiveMinAlertShown) {
        showToast({
          message: t("consultation_end_reminder", { minutes: 5 }),
          autoHide: false,
          type: "info",
        });
        isFiveMinAlertShown;
        clearInterval(interval);
      }
    }, 20000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (
      allChatHistoryQuery.data?.messages &&
      !messages.previousSessions.length
    ) {
      setMessages((prev) => {
        return {
          ...prev,
          previousSessions: allChatHistoryQuery.data.messages,
        };
      });
    }
  }, [allChatHistoryQuery.data]);

  useEffect(() => {
    if (
      (messages.currentSession?.length > 0 ||
        messages.previousSessions?.length > 0) &&
      backdropMessagesContainerRef.current &&
      backdropMessagesContainerRef.current.scrollHeight > 0
    ) {
      backdropMessagesContainerRef.current.scrollTo({
        top: backdropMessagesContainerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [
    messages,
    backdropMessagesContainerRef.current?.scrollHeight,
    debouncedSearch,
  ]);
  const [isProviderTyping, setIsProviderTyping] = useState(false);

  useEffect(() => {
    let messagesToShow = showAllMessages
      ? [...messages.previousSessions, ...messages.currentSession]
      : messages.currentSession;
    messagesToShow?.sort((a, b) => new Date(a.time) - new Date(b.time));
    if (debouncedSearch) {
      messagesToShow = messagesToShow.filter((message) =>
        message.content?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    setDisplayedMessages([...messagesToShow].reverse());
  }, [
    messages,
    chatDataQuery.isLoading,
    clientId,
    areSystemMessagesShown,
    debouncedSearch,
    showAllMessages,
    isProviderTyping,
  ]);

  // Mutations
  const onSendSuccess = (newMessage) => {
    const message = newMessage.message;
    message.senderId = clientId;
    setMessages((prev) => ({
      ...prev,
      currentSession: [...prev.currentSession, message],
    }));
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

        socketRef.current.on("typing", (type) => {
          if (!isProviderTyping && type == "typing") {
            setIsProviderTyping(true);
          } else if (type === "stop") {
            setIsProviderTyping(false);
          }
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
    if (message.content === "provider_left") {
      setIsProviderInSession(false);
    } else if (message.content === "provider_joined") {
      setIsProviderInSession(true);
    }
    setMessages((messages) => {
      return {
        ...messages,
        currentSession: [...messages.currentSession, message],
      };
    });
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
      content: "client_left",
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

  const systemMessageTypes = [
    "client_joined",
    "client_left",
    "client_microphone_on",
    "client_microphone_off",
    "client_camera_on",
    "client_camera_off",
    "provider_joined",
    "provider_left",
    "provider_microphone_on",
    "provider_microphone_off",
    "provider_camera_on",
    "provider_camera_off",
  ];

  const renderMessage = useCallback(
    (message) => {
      if (message.type === "typing") {
        return <TypingIndicator text={t("typing")} />;
      }
      if (message.type === "system") {
        if (!areSystemMessagesShown) return null;
        return (
          <SystemMessage
            key={message.time}
            title={
              systemMessageTypes.includes(message.content)
                ? t(message.content)
                : message.content
            }
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
      content: "client_joined",
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

  const emitTyping = async (type) => {
    const language = await localStorage.getItem("language");
    const country = await localStorage.getItem("country");

    socketRef.current.emit("typing", {
      to: "provider",
      language,
      country,
      chatId: consultation.chatId,
      type,
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
          isProviderInSession={isProviderInSession}
          isChatShown={isChatShown}
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
          height: appStyles.screenHeight * 0.5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        overlayStyles={
          isChatShown
            ? {
                backgroundColor: "transparent",
              }
            : {}
        }
      >
        <View style={styles.optionsContainer}>
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
            }}
          >
            <FlatList
              inverted
              scrollEnabled
              data={chatDataQuery.isLoading ? [] : displayedMessages}
              keyExtractor={(item, index) =>
                item.time.toString() + index.toString()
              }
              renderItem={({ item }) => renderMessage(item)}
              ref={flatListRef}
            />
            {isProviderTyping && <TypingIndicator text={t("typing")} />}

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
                emitTyping={emitTyping}
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
  optionsContainer: {
    backgroundColor: "white",
    width: "100%",
    paddingBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  mr12: { marginRight: 12 },
});
