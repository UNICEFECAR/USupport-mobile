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
        console.log("Location error:", error);
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
      const token = await localStorage.getItem("token");
      const country = await localStorage.getItem("country");
      const language = await localStorage.getItem("language");
      setHeaders({
        Authorization: `Bearer ${token}`,
        "x-country-alpha-2": country,
        "x-language-alpha-2": language,
      });
    }

    if (!hasSetInitialView) {
      getCurrentLocation(true);
      getHeaders();
    }
  }, [hasSetInitialView, getCurrentLocation]);

  // Send organizations data to WebView when they change or map becomes ready
  useEffect(() => {
    if (webViewRef.current && data && data.length > 0 && mapReady) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "SET_ORGANIZATIONS",
          organizations: data,
        })
      );
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
                  // Close any existing selection first
                  setSelectedMarker && setSelectedMarker(null);

                  // Open the new selection with a small delay for clean transition
                  setTimeout(() => {
                    setSelectedMarker && setSelectedMarker(organization);
                  }, 100);

                  // Also zoom to the organization
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
            console.log(
              "Organization marker selected:",
              messageData.organization
            );

            // Close any existing selection first (like web version)
            setSelectedMarker && setSelectedMarker(null);

            // Open the new selection with a small delay for clean transition
            setTimeout(() => {
              setSelectedMarker && setSelectedMarker(messageData.organization);
            }, 100);

            // Call onSelectItem if provided (for additional functionality)
            if (onSelectItem) {
              onSelectItem(messageData.organization);
            }
            break;

          case "MAP_CLICKED":
            // Close backdrop when map is clicked (like web version)
            setSelectedMarker && setSelectedMarker(null);
            break;

          case "ERROR":
            console.error(
              "WebView Error:",
              messageData.message,
              "Line:",
              messageData.line
            );
            break;

          default:
            console.log("Unknown message type:", messageData.type);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error);
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
        allowsInlineMediaPlaybook={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(error) => console.log("WebView error:", error)}
        onHttpError={(error) => console.log("WebView HTTP error:", error)}
        onLoadStart={() => console.log("WebView started loading")}
        onLoadEnd={() => console.log("WebView finished loading")}
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
  mapContainer: {
    flex: 1,
    position: "relative",
    marginTop: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 400,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  controls: {
    position: "absolute",
    right: 16,
    bottom: 16,
    zIndex: 1000,
  },
  permissionDeniedContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  permissionDeniedText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  enableLocationButton: {
    backgroundColor: "#9749fa",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "center",
  },
  enableLocationText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
