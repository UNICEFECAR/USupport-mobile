import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  AppState,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Config from "react-native-config";

const { API_URL_ENDPOINT } = Config;

import { localStorage } from "#services";

import { TransparentModal } from "../../modals";
import { Loading } from "../../loaders";
import { ButtonOnlyIcon } from "../../buttons";

/**
 * InteractiveMap component
 *
 * Interactive map component that displays a Google Map with markers for organizations.
 * Opens ProviderOverview backdrop when markers are selected (similar to web version).
 *
 * @returns {jsx}
 */
export const InteractiveMap = ({
  data = [],
  style,
  onMapReady,
  onSelectItem,
  t,
  setSelectedMarker,
  organizationToZoom,
  onInteractionStart,
  onInteractionEnd,
}) => {
  const webViewRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const [userLocation, setUserLocation] = useState(null);
  const [initialCenter, setInitialCenter] = useState({
    lat: 44.4268,
    lng: 26.1025,
  });
  const [hasSetInitialView, setHasSetInitialView] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [headers, setHeaders] = useState();
  const [showPermissionsContainer, setShowPermissionsContainer] =
    useState(false);

  useEffect(() => {
    if (organizationToZoom) {
      sendMessageToWebView({
        type: "ZOOM_TO_LOCATION",
        lat: organizationToZoom.location.latitude,
        lng: organizationToZoom.location.longitude,
        zoom: 14,
      });
    }
  }, [organizationToZoom, sendMessageToWebView]);

  // Open device settings for location permissions
  const openLocationSettings = useCallback(() => {
    Linking.openSettings();
    setShowPermissionsContainer(false);
  }, []);

  // Request location permission and get current location
  const getCurrentLocation = useCallback(
    async (isInitialLoad = false) => {
      try {
        // Check current permission status first
        const { status: existingStatus } =
          await Location.getForegroundPermissionsAsync();

        // If permission was already denied and this is a manual request, open settings
        if (existingStatus === "denied" && !isInitialLoad) {
          console.log("📍 Opening settings for location permission");
          setShowPermissionsContainer(true);
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.warn("⚠️ Location permission denied");
          if (isInitialLoad) {
            setHasSetInitialView(true);
            setIsLoading(false);
          }
          setLocationPermissionDenied(true);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
          maximumAge: 300000,
        });
        console.log("location", location);
        const { latitude, longitude } = location.coords;
        const userPos = { lat: latitude, lng: longitude };

        setUserLocation(userPos);
        setLocationPermissionDenied(false);

        if (isInitialLoad) {
          setInitialCenter(userPos);
          setHasSetInitialView(true);
          setIsLoading(false);
        }

        // Send location to WebView
        if (webViewRef.current && mapReady) {
          sendMessageToWebView({
            type: "SET_USER_LOCATION",
            location: userPos,
          });
        }
      } catch (error) {
        console.error("❌ Location error:", error);
        if (isInitialLoad) {
          setHasSetInitialView(true);
          setIsLoading(false);
        }
        setLocationPermissionDenied(true);
      }
    },
    [mapReady, openLocationSettings]
  );

  useEffect(() => {
    async function getHeaders() {
      try {
        const token = await localStorage.getItem("token");
        const country = await localStorage.getItem("country");
        const language = await localStorage.getItem("language");

        if (!token) {
          setTimeout(() => {
            getHeaders();
          }, 1000);
          return;
        }

        setHeaders({
          Authorization: `Bearer ${token}`,
          "x-country-alpha-2": country,
          "x-language-alpha-2": language,
        });
      } catch (error) {
        console.error("❌ Error loading headers:", error);
      }
    }

    if (!hasSetInitialView) {
      getCurrentLocation(true);
      getHeaders();
    }
  }, [hasSetInitialView, getCurrentLocation]);

  // Helper function to send messages to WebView (works on both iOS and Android)
  const sendMessageToWebView = useCallback((messageData) => {
    if (!webViewRef.current) return;

    const messageStr = JSON.stringify(messageData);

    // On Android, postMessage doesn't reliably trigger window.addEventListener('message')
    // So we inject JavaScript to dispatch a MessageEvent that the HTML listener can catch
    if (Platform.OS === "android") {
      // Escape the message string for JavaScript injection
      // Need to escape backslashes, quotes, and newlines
      const escapedMessage = messageStr
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");

      const script = `
        (function() {
          try {
            const messageStr = '${escapedMessage}';
            const messageData = JSON.parse(messageStr);
            // Dispatch a MessageEvent that matches what window.addEventListener('message') expects
            const event = new MessageEvent('message', { 
              data: messageData,
              origin: window.location.origin
            });
            window.dispatchEvent(event);
          } catch (e) {
            console.error('Error handling message:', e);
          }
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    } else {
      // On iOS, postMessage works fine
      webViewRef.current.postMessage(messageStr);
    }
  }, []);

  const setOrganizations = () => {
    const messagePayload = {
      type: "SET_ORGANIZATIONS",
      organizations: data,
    };

    sendMessageToWebView(messagePayload);
  };

  // Send organizations data to WebView when they change or map becomes ready
  useEffect(() => {
    if (webViewRef.current && data && data.length > 0 && mapReady) {
      const messagePayload = {
        type: "SET_ORGANIZATIONS",
        organizations: data,
      };

      sendMessageToWebView(messagePayload);
    }
  }, [data, mapReady, sendMessageToWebView]);

  // Send user location when map becomes ready
  useEffect(() => {
    if (webViewRef.current && userLocation && mapReady) {
      sendMessageToWebView({
        type: "SET_USER_LOCATION",
        location: userLocation,
      });
    }
  }, [userLocation, mapReady, sendMessageToWebView]);

  // Recheck location permission when app comes back to foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      // App is coming back to foreground from background/inactive
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("📍 App became active, rechecking location permission");

        // Check if permission status has changed
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted" && locationPermissionDenied) {
          // Permission was granted while in settings, get location now
          setLocationPermissionDenied(false);
          getCurrentLocation(false);
        }
      }

      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [locationPermissionDenied, getCurrentLocation]);

  // Handle messages from WebView
  const handleWebViewMessage = useCallback(
    (event) => {
      try {
        const messageData = JSON.parse(event.nativeEvent.data);

        switch (messageData.type) {
          case "MAP_READY":
            setMapReady(true);
            setIsLoading(false);

            // Provide map controls similar to web version
            if (onMapReady) {
              onMapReady({
                zoomToLocation: (lat, lng, zoom = 12) => {
                  sendMessageToWebView({
                    type: "ZOOM_TO_LOCATION",
                    lat,
                    lng,
                    zoom,
                  });
                },
                selectProvider: (organization) => {
                  setSelectedMarker && setSelectedMarker(null);
                  setTimeout(() => {
                    setSelectedMarker && setSelectedMarker(organization);
                  }, 100);

                  if (
                    organization.location?.latitude &&
                    organization.location?.longitude
                  ) {
                    sendMessageToWebView({
                      type: "ZOOM_TO_LOCATION",
                      lat: organization.location.latitude,
                      lng: organization.location.longitude,
                      zoom: 14,
                    });
                  }
                },
              });
            }
            break;

          case "MARKER_SELECTED":
            setSelectedMarker && setSelectedMarker(null);
            setTimeout(() => {
              setSelectedMarker && setSelectedMarker(messageData.organization);
            }, 100);

            if (onSelectItem) {
              onSelectItem(messageData.organization);
            }
            break;

          case "MAP_CLICKED":
            setSelectedMarker && setSelectedMarker(null);
            break;

          case "ERROR":
            console.error(
              "❌ WebView Error:",
              messageData.message,
              "Line:",
              messageData.line
            );
            break;

          case "MAP_INITIALIZING":
            break;

          case "MESSAGE_RECEIVED":
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(
          "❌ Error parsing WebView message:",
          error,
          "Raw data:",
          event.nativeEvent.data
        );
      }
    },
    [onMapReady, onSelectItem, setSelectedMarker, sendMessageToWebView]
  );

  const handleManualLocationRequest = useCallback(() => {
    getCurrentLocation(false);
  }, [getCurrentLocation]);

  if (isLoading || !hasSetInitialView) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }

  const args = locationPermissionDenied
    ? ""
    : `?lat=${initialCenter.lat}&lng=${initialCenter.lng}`;

  return (
    <>
      <TransparentModal
        heading={t("location_permission_denied")}
        ctaLabel={t("enable_location")}
        ctaHandleClick={openLocationSettings}
        isOpen={showPermissionsContainer}
        handleClose={() => setShowPermissionsContainer(false)}
      />
      <View
        style={[styles.mapContainer, style]}
        onTouchStart={() => {
          onInteractionStart && onInteractionStart();
        }}
        onTouchEnd={() => {
          onInteractionEnd && onInteractionEnd();
        }}
        onTouchCancel={() => {
          onInteractionEnd && onInteractionEnd();
        }}
      >
        {headers?.Authorization && (
          <WebView
            ref={webViewRef}
            source={{
              uri: `${API_URL_ENDPOINT}/v1/user/mobile-map${args}`,
              headers: {
                ...headers,
                ...(Platform.OS === "ios" && {
                  Referer: "https://usupport.online/",
                }),
              },
            }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(error) => {
              console.error("❌ WebView error:", error);
              console.error("Error code:", error?.code);
              console.error("Error description:", error?.description);
            }}
            onHttpError={(error) => {
              console.error("❌ WebView HTTP error:", error);
              console.error("HTTP error statusCode:", error?.statusCode);
              console.error("HTTP error url:", error?.url);
            }}
            originWhitelist={["*"]}
          />
        )}

        <View style={styles.controls}>
          <ButtonOnlyIcon
            iconName="current-location"
            iconSize="lg"
            onPress={handleManualLocationRequest}
          />
        </View>

        {false && (
          <View style={styles.permissionDeniedContainer}>
            <Text style={styles.permissionDeniedText}>
              {t("location_permission_denied")}
            </Text>
            <TouchableOpacity
              style={styles.enableLocationButton}
              onPress={openLocationSettings}
            >
              <Text style={styles.enableLocationText}>
                {t("enable_location")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  controls: {
    bottom: 16,
    position: "absolute",
    right: 16,
    zIndex: 1000,
  },
  enableLocationButton: {
    alignSelf: "center",
    backgroundColor: "#9749fa",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enableLocationText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  mapContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    flex: 1,
    marginTop: 16,
    minHeight: 400,
    overflow: "hidden",
    position: "relative",
  },
  permissionDeniedContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 5,
    left: 16,
    padding: 12,
    position: "absolute",
    right: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: 50,
    zIndex: 1000,
  },
  permissionDeniedText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  webview: {
    backgroundColor: "transparent",
    flex: 1,
  },
});
