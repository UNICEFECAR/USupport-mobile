import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import { localStorage } from "#services";

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
}) => {
  const webViewRef = useRef(null);
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

  useEffect(() => {
    if (organizationToZoom) {
      webViewRef.current?.postMessage(
        JSON.stringify({
          type: "ZOOM_TO_LOCATION",
          lat: organizationToZoom.location.latitude,
          lng: organizationToZoom.location.longitude,
          zoom: 14,
        })
      );
    }
  }, [organizationToZoom]);

  // Request location permission and get current location
  const getCurrentLocation = useCallback(
    async (isInitialLoad = false) => {
      try {
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
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "SET_USER_LOCATION",
              location: userPos,
            })
          );
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
    [mapReady]
  );

  useEffect(() => {
    async function getHeaders() {
      try {
        const token = await localStorage.getItem("token");
        const country = await localStorage.getItem("country");
        const language = await localStorage.getItem("language");
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

  // Send organizations data to WebView when they change or map becomes ready
  useEffect(() => {
    if (webViewRef.current && data && data.length > 0 && mapReady) {
      const messagePayload = {
        type: "SET_ORGANIZATIONS",
        organizations: data,
      };

      webViewRef.current.postMessage(JSON.stringify(messagePayload));
    }
  }, [data, mapReady]);

  // Send user location when map becomes ready
  useEffect(() => {
    if (webViewRef.current && userLocation && mapReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_USER_LOCATION",
          location: userLocation,
        })
      );
    }
  }, [userLocation, mapReady]);

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
                  webViewRef.current?.postMessage(
                    JSON.stringify({
                      type: "ZOOM_TO_LOCATION",
                      lat,
                      lng,
                      zoom,
                    })
                  );
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
                    webViewRef.current?.postMessage(
                      JSON.stringify({
                        type: "ZOOM_TO_LOCATION",
                        lat: organization.location.latitude,
                        lng: organization.location.longitude,
                        zoom: 14,
                      })
                    );
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
    [onMapReady, onSelectItem, setSelectedMarker]
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

  return (
    <View style={[styles.mapContainer, style]}>
      <WebView
        ref={webViewRef}
        source={{
          uri: `https://staging.usupport.online/api/v1/user/mobile-map?lat=${initialCenter.lat}&lng=${initialCenter.lng}`,
          headers,
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

      {!locationPermissionDenied && (
        <View style={styles.controls}>
          <ButtonOnlyIcon
            iconName="current-location"
            iconSize="lg"
            onPress={handleManualLocationRequest}
          />
        </View>
      )}

      {locationPermissionDenied && (
        <View style={styles.permissionDeniedContainer}>
          <Text style={styles.permissionDeniedText}>
            {t("location_permission_denied")}
          </Text>
          <TouchableOpacity
            style={styles.enableLocationButton}
            onPress={handleManualLocationRequest}
          >
            <Text style={styles.enableLocationText}>
              {t("enable_location")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
