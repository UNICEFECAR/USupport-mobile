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
import { io } from "socket.io-client";
import { useKeepAwake } from "@sayem314/react-native-keep-awake";
import notifee, { AndroidImportance } from "@notifee/react-native";
import Config from "react-native-config";

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
} from "#hooks";

import { localStorage, Context } from "#services";
import { showToast, ONE_HOUR, getDateView, systemMessageTypes } from "#utils";
import { appStyles } from "#styles";

import { SafetyFeedback } from "../SafetyFeedback";
import { JitsiMeeting } from "../JitsiMeeting/JitsiMeeting";
import { Loading } from "../../components/loaders";

const { SOCKET_IO_URL } = Config;

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
    setMessages((prev) => ({
      ...prev,
      currentSession: data.messages,
    }));
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

    await notifee.cancelAllNotifications();
    await notifee.stopForegroundService();

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
            <Message
              key={message.time}
              message={message.content}
              sent
              date={new Date(Number(message.time))}
              showDate={message.showDate}
            />
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
            isProviderInSession={isProviderInSession}
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
});
