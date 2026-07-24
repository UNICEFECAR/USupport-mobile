import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import Share from "react-native-share";

import {
  Icon,
  AppText,
  Avatar,
  Message,
  SystemMessage,
  NewButton,
  Toggle,
  InputSearch,
  Loading,
} from "#components";
import { appStyles } from "#styles";
import {
  useGetChatData,
  useGetAllChatHistoryData,
  useDebounce,
  useGetTheme,
  useGetProviderStatus,
} from "#hooks";
import {
  systemMessageTypes,
  generateActivityHistoryChatPDF,
  showToast,
  getDateView,
  getTimeAsString,
} from "#utils";

import Config from "react-native-config";
import { logoVertical, logoVerticalDark } from "../../assets";

const { AMAZON_S3_BUCKET } = Config;

export const ActivityHistory = ({
  navigation,
  openSelectConsultation,
  consultation,
  providerId,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "activity-history" });
  const { t: tGoBack } = useTranslation("screens", { keyPrefix: "screen" });
  const { colors, isDarkMode } = useGetTheme();

  const [search, setSearch] = useState("");
  const [showSystemMessages, setShowSystemMessages] = useState(true);
  const [showAllConsultations, setShowAllConsultations] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const scrollViewRef = useRef(null);

  const chatQueryData = useGetChatData(consultation?.chatId);
  const allChatHistoryQuery = useGetAllChatHistoryData(
    providerId,
    chatQueryData.data?.clientDetailId,
    showAllConsultations
  );
  const providerStatusQuery = useGetProviderStatus(providerId);
  const providerStatus = providerStatusQuery.data?.status;

  const baseMessages = useMemo(() => {
    if (showAllConsultations && allChatHistoryQuery.data) {
      return allChatHistoryQuery.data.messages || [];
    }
    return chatQueryData.data?.messages || [];
  }, [
    showAllConsultations,
    allChatHistoryQuery.data,
    chatQueryData.data?.messages,
  ]);

  const debouncedSearch = useDebounce(search, 500);

  const filteredMessages = useMemo(() => {
    let messages = baseMessages;

    if (!showSystemMessages) {
      messages = messages.filter((msg) => msg.type !== "system");
    }

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      messages = messages.filter((msg) =>
        msg.content.toLowerCase().includes(searchLower)
      );
    }

    return messages.map((msg) => ({
      ...msg,
      dateObj: new Date(Number(msg.time)),
    }));
  }, [baseMessages, showSystemMessages, debouncedSearch]);

  useEffect(() => {
    setIsFiltering(false);
  }, [filteredMessages.length, showAllConsultations]);

  useEffect(() => {
    if (filteredMessages.length === 0 || isFiltering) return undefined;
    const id = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 120);
    return () => clearTimeout(id);
  }, [
    filteredMessages.length,
    showAllConsultations,
    debouncedSearch,
    showSystemMessages,
    isFiltering,
  ]);

  const handleToggleSystemMessages = () => {
    setIsFiltering(true);
    setShowSystemMessages((v) => !v);
  };

  const handleSchedule = () => {
    openSelectConsultation();
  };

  const imageUri = AMAZON_S3_BUCKET + "/" + (consultation.image || "default");

  const buildPdfRows = useCallback(() => {
    return filteredMessages.map((msg) => {
      const isSystem = msg.type === "system";
      const body = isSystem
        ? systemMessageTypes.includes(msg.content)
          ? t(msg.content)
          : msg.content
        : msg.content;
      return {
        isSystem,
        isSent: msg.senderId !== providerId,
        body,
        date: msg.dateObj,
      };
    });
  }, [filteredMessages, providerId, t]);

  const handleExportPdf = useCallback(async () => {
    try {
      setIsPdfExporting(true);
      const logoSource = isDarkMode ? logoVerticalDark : logoVertical;
      const logoUri = Image.resolveAssetSource(logoSource)?.uri;
      const exportedAtLine = t("exported_at", {
        time: `${getTimeAsString(new Date())}, ${getDateView(new Date())}`,
      });
      const file = await generateActivityHistoryChatPDF({
        rows: buildPdfRows(),
        providerName: consultation.providerName,
        chatHistoryHeading: t("chat_history"),
        exportedAtLine,
        logoUri,
      });

      if (file && (file.base64 || file.filePath)) {
        if (Platform.OS === "android") {
          showToast({
            message: t("download_success"),
            type: "success",
          });
        }

        let url;
        if (Platform.OS === "ios") {
          if (file.filePath) {
            url = file.filePath.startsWith("file://")
              ? file.filePath
              : `file://${file.filePath}`;
          } else if (file.base64) {
            url = `data:application/pdf;base64,${file.base64}`;
          }
        } else if (file.base64) {
          url = `data:application/pdf;base64,${file.base64}`;
        } else if (file.filePath) {
          url = file.filePath.startsWith("file://")
            ? file.filePath
            : `file://${file.filePath}`;
        }

        if (!url) {
          console.error("Activity history PDF: missing file URL");
          return;
        }

        const safeSubject = String(consultation.providerName || "Chat").slice(
          0,
          120
        );
        await Share.open({
          title: t("export_label"),
          subject: `Chat-history-${safeSubject}`,
          url,
          type: "application/pdf",
          saveToFiles: Platform.OS === "ios",
          failOnCancel: Platform.OS === "ios",
        });

        if (Platform.OS === "ios") {
          showToast({
            message: t("download_success"),
            type: "success",
          });
        }
      }
    } catch (error) {
      if (error?.message && !String(error.message).includes("did not share")) {
        console.error("Activity history PDF export:", error);
      }
    } finally {
      setIsPdfExporting(false);
    }
  }, [buildPdfRows, consultation, isDarkMode, t]);

  const themed = useThemedActivityStyles(colors, isDarkMode);

  if (chatQueryData.isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <Loading size="lg" />
      </View>
    );
  }

  const messagesBusy =
    isFiltering || (showAllConsultations && allChatHistoryQuery.isLoading);

  return (
    <View style={[styles.root, themed.rootFill]}>
      <View
        style={[
          styles.card,
          themed.cardSurface,
          !isDarkMode && styles.cardShadowLight,
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBackRow}
          accessibilityRole="button"
        >
          <Icon
            name="arrow-chevron-back"
            size="md"
            color={appStyles.colorPrimary_20809e}
          />
          <AppText namedStyle="text" style={styles.goBackLabel}>
            {tGoBack("go_back")}
          </AppText>
        </TouchableOpacity>

        <View style={[styles.header, themed.sectionDivider]}>
          <View style={styles.providerRow}>
            <Avatar style={styles.avatar} image={{ uri: imageUri }} />
            <View style={styles.providerTextCol}>
              <AppText namedStyle="text" style={styles.subtitle}>
                {t("chat_history")}
              </AppText>
              <AppText namedStyle="h3" style={styles.providerName}>
                {consultation.providerName}
              </AppText>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <NewButton
              size="sm"
              label={t("export_label")}
              iconName="download"
              iconColor="#ffffff"
              loading={isPdfExporting}
              onPress={handleExportPdf}
              style={styles.actionButton}
            />
            {providerStatus === "active" && (
              <NewButton
                label={t("button_label")}
                iconName="calendar"
                iconColor="#ffffff"
                size="sm"
                onPress={handleSchedule}
                style={styles.actionButton}
              />
            )}
          </View>
        </View>

        <View style={[styles.controls, themed.sectionDivider]}>
          <InputSearch
            value={search}
            onChange={setSearch}
            placeholder={t("search")}
            style={styles.search}
          />
          <View style={styles.togglesCol}>
            <View style={styles.toggleRow}>
              <AppText namedStyle="text" style={styles.toggleLabel}>
                {t("show_system_messages")}
              </AppText>
              <Toggle
                isToggled={showSystemMessages}
                handleToggle={handleToggleSystemMessages}
              />
            </View>
            <View style={styles.toggleRow}>
              <AppText namedStyle="text" style={styles.toggleLabel}>
                {t("show_previous_consultations")}
              </AppText>
              <Toggle
                isToggled={showAllConsultations}
                handleToggle={() => setShowAllConsultations((v) => !v)}
              />
            </View>
          </View>
        </View>

        <View style={styles.messagesWrap}>
          {messagesBusy ? (
            <View style={styles.messagesLoading}>
              <Loading size="lg" />
            </View>
          ) : filteredMessages.length === 0 ? (
            <AppText namedStyle="text" style={styles.empty}>
              {t("no_messages")}
            </AppText>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {filteredMessages.map((message, index) => {
                if (message.type === "system") {
                  return (
                    <SystemMessage
                      key={`${message.time}-${index}`}
                      title={
                        systemMessageTypes.includes(message.content)
                          ? t(message.content)
                          : message.content
                      }
                      date={message.dateObj}
                    />
                  );
                }
                const isSent = message.senderId !== providerId;
                return (
                  <Message
                    key={`${message.time}-${index}`}
                    message={message.content}
                    sent={isSent}
                    received={!isSent}
                    date={message.dateObj}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

function useThemedActivityStyles(colors, isDarkMode) {
  return useMemo(
    () =>
      StyleSheet.create({
        rootFill: {
          backgroundColor: colors.background,
        },
        cardSurface: isDarkMode
          ? {
              backgroundColor: "rgba(30, 32, 40, 0.92)",
              borderColor: colors.border || appStyles.colorGray_344054,
              borderWidth: 1,
            }
          : {
              backgroundColor: appStyles.colorCardMediaSurfaceLight_rgba,
              borderColor: appStyles.colorCardMediaBorderLight_rgba,
              borderWidth: 1,
            },
        sectionDivider: {
          borderBottomColor: isDarkMode
            ? colors.border || appStyles.colorGray_344054
            : appStyles.colorGray_ea,
        },
      }),
    [colors.background, colors.border, isDarkMode]
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  goBackLabel: {
    marginLeft: 8,
    color: appStyles.colorPrimary_20809e,
  },
  loadingRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    minHeight: 0,
    borderRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 0,
    overflow: "hidden",
  },
  cardShadowLight: {
    shadowColor: appStyles.colorCardMediaShadowLight_rgba,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  providerTextCol: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    marginBottom: 0,
    opacity: 0.7,
  },
  providerName: {
    fontSize: 18,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexShrink: 0,
  },
  controls: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  search: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "stretch",
  },
  togglesCol: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  toggleLabel: {
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  messagesWrap: {
    flex: 1,
    minHeight: 0,
    marginTop: 8,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  messagesLoading: {
    flex: 1,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 48,
    opacity: 0.7,
  },
});
