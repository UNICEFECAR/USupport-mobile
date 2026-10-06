import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { io } from "socket.io-client";
import Config from "react-native-config";

import { localStorage } from "#services";

const { SOCKET_IO_URL } = Config;

// Short blips reconnect on their own, so the notice is shown only if the connection stays down
const RECONNECTING_NOTICE_DELAY = 2000;
const RESTORED_NOTICE_DURATION = 3000;

// The connection quality is measured by the round trip time of a small message to the gateway
const LATENCY_CHECK_INTERVAL = 5000;
const LATENCY_CHECK_TIMEOUT = 3000;
const POOR_LATENCY = 1500;
const GOOD_LATENCY = 800;
// Consecutive slow/fast checks needed to change the quality, so a single spike is ignored
const QUALITY_CHANGE_CHECKS = 2;

/**
 * The status shown to the user, from most to least important:
 * "reconnecting" | "peer_lost" | "poor" | "peer_poor" | "restored" | "peer_restored" | "online"
 */
const getDisplayedStatus = (
  ownStatus,
  isPoorConnection,
  peerStatus,
  peerQuality
) => {
  if (ownStatus === "reconnecting") return "reconnecting";
  if (peerStatus === "lost") return "peer_lost";
  if (isPoorConnection) return "poor";
  if (peerQuality === "poor") return "peer_poor";
  if (ownStatus === "restored") return "restored";
  if (peerStatus === "restored") return "peer_restored";
  return "online";
};

/**
 * "lost" if either side is disconnected, "poor" if either side has a poor connection, "good" otherwise
 */
const getCallQuality = (ownStatus, isPoorConnection, peerStatus, peerQuality) => {
  if (ownStatus === "reconnecting" || peerStatus === "lost") return "lost";
  if (isPoorConnection || peerQuality === "poor") return "poor";
  return "good";
};

/**
 * useConsultationSocket
 *
 * Keeps the consultation chat connected to the gateway: rejoins the chat after every reconnect,
 * refetches the messages missed while disconnected and tracks the connection of both participants
 *
 * @param {string} chatId
 * @param {function} receiveMessage - called with every message from the provider
 * @param {function} setIsProviderTyping
 *
 * @returns {{ socketRef, leaveChat: function, connectionStatus: string, callQuality: string, isPeerPresent: boolean | null }}
 */
export const useConsultationSocket = ({
  chatId,
  receiveMessage,
  setIsProviderTyping,
}) => {
  const queryClient = useQueryClient();

  // "online" | "reconnecting" | "restored"
  const [ownStatus, setOwnStatus] = useState("online");
  const [isPoorConnection, setIsPoorConnection] = useState(false);
  // Connection of the other participant: "online" | "lost" | "restored"
  const [peerStatus, setPeerStatus] = useState("online");
  // Connection quality reported by the other participant: "good" | "poor"
  const [peerQuality, setPeerQuality] = useState("good");
  // Whether the other participant has the consultation open, as reported by the gateway.
  // null until it is known (e.g. a gateway without presence support)
  const [isPeerPresent, setIsPeerPresent] = useState(null);

  const socketRef = useRef();
  // Set once the client leaves the consultation, so nothing reconnects the socket afterwards
  const hasLeftRef = useRef(false);

  useEffect(() => {
    let isUnmounted = false;
    let isNoticeShown = false;
    let reconnectingNoticeTimeout, restoredNoticeTimeout, peerRestoredTimeout;
    let latencyCheckInterval, unsubscribeNetInfo, appStateSubscription;

    const showReconnectingNotice = () => {
      clearTimeout(reconnectingNoticeTimeout);
      clearTimeout(restoredNoticeTimeout);
      isNoticeShown = true;
      setOwnStatus("reconnecting");
    };

    const handleConnectionRestored = () => {
      clearTimeout(reconnectingNoticeTimeout);
      if (!isNoticeShown) return;

      isNoticeShown = false;
      setOwnStatus("restored");
      restoredNoticeTimeout = setTimeout(
        () => setOwnStatus("online"),
        RESTORED_NOTICE_DURATION
      );
    };

    // Connection quality
    let slowChecks = 0;
    let fastChecks = 0;
    // Checks are evaluated only once the gateway has answered one, so a gateway
    // without support for them is not reported as a poor connection
    let isLatencyCheckSupported = false;

    const resetConnectionQuality = () => {
      slowChecks = 0;
      fastChecks = 0;
      setIsPoorConnection(false);
    };

    const checkLatency = () => {
      const socket = socketRef.current;
      if (!socket?.connected) return;

      const startTime = Date.now();
      socket.timeout(LATENCY_CHECK_TIMEOUT).emit("latency check", (err) => {
        if (!err) isLatencyCheckSupported = true;
        if (!isLatencyCheckSupported || !socket.connected) return;

        const latency = err ? Infinity : Date.now() - startTime;
        if (latency >= POOR_LATENCY) {
          fastChecks = 0;
          slowChecks += 1;
          if (slowChecks >= QUALITY_CHANGE_CHECKS) setIsPoorConnection(true);
        } else if (latency <= GOOD_LATENCY) {
          slowChecks = 0;
          fastChecks += 1;
          if (fastChecks >= QUALITY_CHANGE_CHECKS) setIsPoorConnection(false);
        }
      });
    };

    // Reconnect right away instead of waiting for the next reconnection attempt.
    // The socket may still look connected until the ping timeout detects the dead connection,
    // so a fresh connection is forced
    const reconnectNow = () => {
      if (hasLeftRef.current || !socketRef.current) return;
      socketRef.current.disconnect().connect();
    };

    const connect = async () => {
      const language = await localStorage.getItem("language");
      const country = await localStorage.getItem("country");
      if (isUnmounted) return;

      const socket = io(SOCKET_IO_URL, {
        path: "/api/v1/ws/socket.io",
        transports: ["websocket"],
        secure: true,
        rememberUpgrade: true,
      });
      socketRef.current = socket;

      // Every (re)connect creates a new server-side socket, so the chat has to be joined each time
      let hasConnectedBefore = false;
      socket.on("connect", () => {
        // The other participant may have reconnected meanwhile, the gateway reports it again if not
        clearTimeout(peerRestoredTimeout);
        setPeerStatus("online");
        setPeerQuality("good");
        setIsPeerPresent(null);

        socket.emit("join chat", {
          country,
          language,
          chatId,
          userType: "client",
        });

        // Messages sent while this socket was disconnected were only persisted, not delivered
        if (hasConnectedBefore) {
          queryClient.invalidateQueries(["chat-data", chatId]);
        }
        hasConnectedBefore = true;

        handleConnectionRestored();
      });

      socket.on("disconnect", (reason) => {
        resetConnectionQuality();

        // Disconnected on purpose when leaving the consultation
        if (reason === "io client disconnect") return;

        // The client does not reconnect by itself after a server-side disconnect
        if (reason === "io server disconnect") {
          socket.connect();
        }

        clearTimeout(reconnectingNoticeTimeout);
        reconnectingNoticeTimeout = setTimeout(
          showReconnectingNotice,
          RECONNECTING_NOTICE_DELAY
        );
      });

      socket.on("peer connection", (status) => {
        clearTimeout(peerRestoredTimeout);
        if (status === "lost") {
          setPeerStatus("lost");
        } else if (status === "restored") {
          setPeerStatus("restored");
          peerRestoredTimeout = setTimeout(
            () => setPeerStatus("online"),
            RESTORED_NOTICE_DURATION
          );
        }
      });

      socket.on("peer quality", (quality) => {
        setPeerQuality(quality === "poor" ? "poor" : "good");
      });

      socket.on("peer presence", (presence) => {
        setIsPeerPresent(presence === "present");
      });

      socket.on("receive message", receiveMessage);

      socket.on("typing", (type) => {
        setIsProviderTyping(type === "typing");
      });

      latencyCheckInterval = setInterval(checkLatency, LATENCY_CHECK_INTERVAL);

      // The device knows immediately when the network is gone
      let wasOnline = true;
      unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        // null while the reachability is still being checked
        const isOnline = state.isConnected && state.isInternetReachable !== false;
        if (!isOnline && wasOnline) {
          showReconnectingNotice();
        } else if (isOnline && !wasOnline) {
          reconnectNow();
        }
        wasOnline = isOnline;
      });

      // The OS may suspend the connection while the app is in the background
      appStateSubscription = AppState.addEventListener("change", (state) => {
        if (state === "active" && !socket.connected) reconnectNow();
      });
    };

    connect();

    return () => {
      isUnmounted = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off();
      }
      clearInterval(latencyCheckInterval);
      clearTimeout(reconnectingNoticeTimeout);
      clearTimeout(restoredNoticeTimeout);
      clearTimeout(peerRestoredTimeout);
      unsubscribeNetInfo?.();
      appStateSubscription?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Let the other participant know about the quality of this connection
  const hasReportedQuality = useRef(false);
  useEffect(() => {
    // Nothing to report until the quality changes for the first time
    if (!hasReportedQuality.current && !isPoorConnection) return;
    hasReportedQuality.current = true;

    socketRef.current?.emit("connection quality", {
      chatId,
      userType: "client",
      quality: isPoorConnection ? "poor" : "good",
    });
  }, [isPoorConnection]);

  // Leaving is not a lost connection, so the provider is told the client is gone instead
  const leaveChat = () => {
    hasLeftRef.current = true;
    socketRef.current?.disconnect();
  };

  return {
    socketRef,
    leaveChat,
    isPeerPresent,
    connectionStatus: getDisplayedStatus(
      ownStatus,
      isPoorConnection,
      peerStatus,
      peerQuality
    ),
    // Health of the call, from both sides, shown by the connection icon in the controls
    callQuality: getCallQuality(ownStatus, isPoorConnection, peerStatus, peerQuality),
  };
};

export default useConsultationSocket;
