import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useKeepAwake } from "@sayem314/react-native-keep-awake";
import notifee, { AndroidImportance } from "@notifee/react-native";

import {
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
  useGetClientData,
  useConsultationSocket,
} from "#hooks";

import { localStorage, Context, messageSvc } from "#services";
import { showToast, ONE_HOUR, getDateView, systemMessageTypes } from "#utils";
import { appStyles } from "#styles";

import { SafetyFeedback } from "../SafetyFeedback";
import { JitsiMeeting } from "../JitsiMeeting/JitsiMeeting";
import { Loading } from "../../components/loaders";

// On a bad connection a request can hang for a long time, so the message can be retried meanwhile
const SEND_MESSAGE_TIMEOUT = 15000;

/**
 * Consultation
 *
 * Video - text consultation page
 *
 * @returns {JSX.Element}
 */
export const Consultation = ({ navigation, route }) => {
  const { t } = useTranslation("screens", { keyPrefix: "consultation-page" });
  const location = route.params;
  const backdropMessagesContainerRef = useRef();

  const { setIsInConsultation } = useContext(Context);

  const consultation = location?.consultation;
  const joinWithVideo = location?.videoOn;
  const joinWithMicrophone = location?.microphoneOn;
  const cameraGranted = location?.cameraGranted;
  const microphoneGranted = location?.microphoneGranted;

  const [clientDataQuery, clientData] = useGetClientData();

  useKeepAwake();

  const startForegroundService = async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    await notifee.requestPermission();

    const channelId = await notifee.createChannel({
      id: "foreground_service",
      name: "Foreground Service",
      importance: AndroidImportance.HIGH,
      sound: "default",
    });

    await notifee.displayNotification({
      title: t("consultation_in_progress"),
      body: t("microphone_active"),
      android: {
        channelId,
        asForegroundService: true,
        ongoing: true, // Prevents user from dismissing it
        pressAction: {
          id: "default",
        },
      },
    });

    notifee.registerForegroundService(() => {
      return new Promise(() => {
        console.log("Registered foreground service");
      });
    });
  };

  useEffect(() => {
    setIsInConsultation(true);
    if (Platform.OS === "android") {
      setTimeout(() => {
        startForegroundService();
      }, 2000);
    }

    return async () => {
      setIsInConsultation(false);
      if (Platform.OS === "android") {
        await notifee.stopForegroundService();
      }
    };
  }, []);

  if (!consultation) return null;

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

  const [keyboardHeight, setKeyboardHeight] = useState(200);

  const debouncedSearch = useDebounce(search, 500);

  const checkHasProviderJoined = (messages) => {
    // Sort the messages by time descending so the latest messages are first
    // Then check which one of the following two cases is true:
    const joinMessages = messages
      .filter(
        (x) =>
          x?.content === "provider_joined" || x?.content === "provider_left"
      )
      ?.sort((a, b) => new Date(Number(b.time)) - new Date(Number(a.time)));
    return joinMessages[0]
      ? joinMessages[0].content === "provider_joined"
      : false;
  };

  const onGetChatDataSuccess = (data) => {
    setIsProviderInSession(checkHasProviderJoined(data.messages));
    setMessages((prev) => {
      // Keep messages sent from this device that are not saved yet (still sending or failed)
      const savedTimes = new Set(data.messages.map((message) => message.time));
      const unsavedMessages = prev.currentSession.filter(
        (message) => message.status && !savedTimes.has(message.time)
      );
      return {
        ...prev,
        currentSession: [...data.messages, ...unsavedMessages],
      };
    });
  };

  const chatDataQuery = useGetChatData(
    consultation?.chatId,
    onGetChatDataSuccess
  );

  const clientId = chatDataQuery.data?.clientDetailId;
  const providerId = chatDataQuery.data?.providerDetailId;
  const allChatHistoryQuery = useGetAllChatHistoryData(
    providerId,
    clientId,
    chatDataQuery.isFetched
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
        isFiveMinAlertShown = true;
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
      chatDataQuery.data?.messages &&
      !messages.previousSessions.length
    ) {
      setMessages((prev) => {
        const currentMessagesTimes = chatDataQuery.data.messages.map(
          (x) => x.time
        );
        const previousFiltered = allChatHistoryQuery.data.messages
          .flat()
          .filter((x) => !currentMessagesTimes.includes(x.time));
        return {
          ...prev,
          previousSessions: previousFiltered,
        };
      });
    }
  }, [allChatHistoryQuery.data, chatDataQuery.data]);

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

  const receiveMessage = (message) => {
    setHasUnreadMessages(true);
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    if (message.content === "provider_left") {
      setIsProviderInSession(false);
    } else if (message.content === "provider_joined") {
      setIsProviderInSession(true);
    }
    setMessages((messages) => {
      // The same message arrives twice when its sender retried it while the first attempt was still in flight
      const isDuplicate = messages.currentSession.some(
        (x) => x.time === message.time && x.content === message.content
      );
      if (isDuplicate) return messages;

      return {
        ...messages,
        currentSession: [...messages.currentSession, message],
      };
    });
  };

  const { socketRef, leaveChat, isPeerPresent, connectionStatus, callQuality } =
    useConsultationSocket({
      chatId: consultation.chatId,
      receiveMessage,
      setIsProviderTyping,
    });

  const updateMessageStatus = (time, status) => {
    setMessages((prev) => ({
      ...prev,
      currentSession: prev.currentSession.map((message) => {
        // Only messages sent from this device have a status, saved ones are left untouched
        if (message.time !== time || !message.status) return message;
        if (status) return { ...message, status };

        const { status: _sentStatus, ...sentMessage } = message;
        return sentMessage;
      }),
    }));
  };

  const sendMessage = async (message) => {
    const { status, ...messageToSend } = message;
    updateMessageStatus(message.time, "sending");

    const language = await localStorage.getItem("language");
    const country = await localStorage.getItem("country");

    const timeout = setTimeout(
      () => updateMessageStatus(message.time, "failed"),
      SEND_MESSAGE_TIMEOUT
    );

    messageSvc
      .sendMessage({ message: messageToSend, chatId: consultation.chatId })
      .then(() => {
        clearTimeout(timeout);
        updateMessageStatus(message.time, null);

        socketRef.current?.emit("send message", {
          language,
          country,
          chatId: consultation.chatId,
          to: "provider",
          message: messageToSend,
        });
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error("Failed to send the message", {
          chatId: consultation.chatId,
          status: err?.response?.status,
          error: err?.response?.data?.error || err?.message,
        });
        updateMessageStatus(message.time, "failed");
      });
  };

  const handleSendMessage = (content, type = "text") => {
    if (hasUnreadMessages) {
      setHasUnreadMessages(false);
    }

    const message = {
      content,
      type,
      time: JSON.stringify(new Date().getTime()),
      senderId: clientId,
      status: "sending",
    };

    // Shown right away, with its status updated as it is being sent
    setMessages((prev) => ({
      ...prev,
      currentSession: [...prev.currentSession, message],
    }));
    sendMessage(message);
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

  // Jitsi reports both "conference left" and "ready to close" when the call ends
  const hasLeftRef = useRef(false);
  const leaveConsultation = async () => {
    if (hasLeftRef.current) return;
    hasLeftRef.current = true;

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

    await notifee.cancelAllNotifications();
    await notifee.stopForegroundService();

    sendMessageMutation.mutate({
      chatId: consultation.chatId,
      message: leaveMessage,
    });

    socketRef.current?.emit("send message", {
      language,
      country,
      chatId: consultation.chatId,
      to: "provider",
      message: leaveMessage,
    });
    leaveChat();
  };

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
            showDate={message.showDate}
          />
        );
      } else {
        if (message.senderId === clientId) {
          return (
            <React.Fragment key={message.time}>
              <Message
                message={message.content}
                sent
                date={new Date(Number(message.time))}
                showDate={message.showDate}
                style={message.status ? styles.unsentMessage : null}
              />
              {message.status && (
                <MessageStatus
                  status={message.status}
                  onRetry={() => sendMessage(message)}
                  t={t}
                />
              )}
            </React.Fragment>
          );
        } else {
          return (
            <Message
              key={message.time}
              message={message.content}
              received
              date={new Date(Number(message.time))}
              showDate={message.showDate}
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

    socketRef.current?.emit("send message", {
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

    socketRef.current?.emit("typing", {
      to: "provider",
      language,
      country,
      chatId: consultation.chatId,
      type,
    });
  };

  const lastDate = useRef();
  const calculateMessagesToShowDate = useMemo(() => {
    const messagesToShow = [...displayedMessages].reverse().map((message) => {
      const currentMessageDate = getDateView(new Date(Number(message.time)));
      if (currentMessageDate !== lastDate.current) {
        lastDate.current = currentMessageDate;
        message.showDate = true;
      }

      return message;
    });
    return messagesToShow.reverse();
  }, [displayedMessages]);

  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  // The gateway knows whether the provider has the consultation open,
  // the join/leave messages are a fallback until it reports it
  const isProviderShownInSession = isPeerPresent ?? isProviderInSession;

  return isSafetyFeedbackShown ? (
    <SafetyFeedback
      answers={securityCheckAnswers}
      consultationId={consultation.consultationId}
      navigation={navigation}
    />
  ) : (
    <View style={styles.container}>
      <View style={{ flexGrow: 1 }}>
        {clientData ? (
          <JitsiMeeting
            joinWithVideo={joinWithVideo}
            joinWithMicrophone={joinWithMicrophone}
            cameraGranted={cameraGranted}
            microphoneGranted={microphoneGranted}
            consultation={consultation}
            toggleChat={toggleChat}
            leaveConsultation={leaveConsultation}
            handleSendMessage={handleSendMessage}
            sendJoinConsultationMessage={sendJoinConsultationMessage}
            navigation={navigation}
            hasUnread={hasUnreadMessages}
            isProviderInSession={isProviderShownInSession}
            connectionStatus={connectionStatus}
            callQuality={callQuality}
            setIsProviderInSession={setIsProviderInSession}
            isChatShown={isChatShown}
            isKeyboardShown={isKeyboardShown}
            keyboardHeight={keyboardHeight}
            displayName={
              clientData?.name
                ? `${clientData?.name} ${clientData?.surname}`
                : clientData?.nickname
            }
            t={t}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        )}
      </View>

      <Backdrop
        isOpen={isChatShown}
        onClose={() => {
          setIsChatShown(false);
          setHasUnreadMessages(false);
        }}
        setKeyboardHeight={setKeyboardHeight}
        customRender
        hasKeyboardListener
        isInVideoTherapy
        handleShowKeyboard={() => {
          setIsKeyboardShown(true);
        }}
        handleHideKeyboard={() => setIsKeyboardShown(false)}
        style={{
          height: appStyles.screenHeight * (isKeyboardShown ? 0.3 : 0.5),
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
            <AppText
              underlined
              onPress={() => setShowOptions(!showOptions)}
              style={{
                fontSize: 16,
                color: appStyles.colorPrimary_20809e,
              }}
            >
              {t(showOptions ? "hide_options" : "show_options")}
            </AppText>
          </View>
          {showOptions ? (
            <View style={{ marginTop: 4 }}>
              <View style={styles.toggleContainer}>
                <Toggle
                  isToggled={areSystemMessagesShown}
                  handleToggle={() =>
                    setAreSystemMessagesShown(!areSystemMessagesShown)
                  }
                  style={styles.toggle}
                />
                <AppText style={styles.fs14}>
                  {t("show_system_messages")}
                </AppText>
              </View>
              <View style={styles.toggleContainer}>
                <Toggle
                  isToggled={showAllMessages}
                  handleToggle={() => setShowAllMessages(!showAllMessages)}
                  style={styles.toggle}
                />
                <AppText style={styles.fs14}>
                  {t("show_previous_consultations")}
                </AppText>
              </View>
              <InputSearch
                value={search}
                onChange={setSearch}
                style={{
                  marginTop: 12,
                }}
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
              data={chatDataQuery.isLoading ? [] : calculateMessagesToShowDate}
              keyExtractor={(item, index) =>
                item.time.toString() + index.toString() + new Date().getTime()
              }
              renderItem={({ item }) => renderMessage(item)}
              ref={flatListRef}
            />
            {isProviderTyping && <TypingIndicator text={t("typing")} />}

            <View style={styles.sendMessageContainer}>
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

const MessageStatus = ({ status, onRetry, t }) =>
  status === "failed" ? (
    <View style={styles.messageStatus} accessibilityRole="alert">
      <AppText namedStyle="smallText" style={styles.messageStatusFailed}>
        {t("message_not_sent")}
      </AppText>
      <TouchableOpacity onPress={onRetry} hitSlop={styles.retryHitSlop}>
        <AppText
          namedStyle="smallText"
          underlined
          isSemibold
          style={styles.messageStatusFailed}
        >
          {t("message_retry")}
        </AppText>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.messageStatus}>
      <AppText namedStyle="smallText" style={styles.messageStatusSending}>
        {t("message_sending")}
      </AppText>
    </View>
  );

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
    width: "100%",
    paddingBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  toggle: {
    marginRight: 12,
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sendMessageContainer: {
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  fs: {
    fontSize: 14,
  },
  unsentMessage: {
    marginBottom: 4,
    opacity: 0.6,
  },
  messageStatus: {
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  messageStatusSending: {
    color: appStyles.colorGray_66768d,
  },
  messageStatusFailed: {
    color: appStyles.colorRed_eb5757,
  },
  retryHitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
});
