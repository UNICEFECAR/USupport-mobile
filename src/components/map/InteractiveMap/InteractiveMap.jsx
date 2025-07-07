import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

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
  googleMapsApiKey,
  setSelectedMarker,
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
    if (!hasSetInitialView) {
      getCurrentLocation(true);
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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body, html { 
                margin: 0; 
                padding: 0; 
                height: 100%; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #map { 
                height: 100vh; 
                width: 100%; 
            }
            .loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div id="loading" class="loading">Loading map...</div>
        <div id="map"></div>
        
        <script>
            // Error handling
            window.onerror = function(msg, url, lineNo, columnNo, error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ERROR',
                    message: msg,
                    line: lineNo,
                    column: columnNo
                }));
                return false;
            };

            let map;
            let markers = [];
            let userLocationMarker;
            
            async function initMap() {
                try {
                    console.log('Starting map initialization...');
                    
                    const { Map } = await google.maps.importLibrary("maps");
                    const { Marker } = await google.maps.importLibrary("marker");
                    
                    map = new Map(document.getElementById("map"), {
                        zoom: ${userLocation ? 8 : 6},
                        center: { lat: ${initialCenter.lat}, lng: ${initialCenter.lng} },
                        disableDefaultUI: true,
                        gestureHandling: 'greedy',
                        clickableIcons: false,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                    });
                    
                    // Hide loading indicator
                    const loading = document.getElementById('loading');
                    if (loading) {
                        loading.style.display = 'none';
                    }
                    
                    // Add click listener to close backdrop (like web version)
                    map.addListener("click", () => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'MAP_CLICKED'
                        }));
                    });
                    
                    console.log('Map initialized successfully');
                    
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_READY'
                    }));
                    
                } catch (error) {
                    console.error('Map initialization error:', error);
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'ERROR',
                        message: 'Map initialization failed: ' + error.message
                    }));
                }
            }
            
            function createOrganizationMarkers(organizations) {
                console.log('Creating markers for', organizations.length, 'organizations');
                
                // Clear existing markers
                markers.forEach(marker => marker.setMap(null));
                markers = [];
                
                organizations.forEach((organization) => {
                    // Validate organization has valid location data
                    if (!organization.location || 
                        typeof organization.location.latitude !== 'number' || 
                        typeof organization.location.longitude !== 'number') {
                        console.warn('Skipping organization with invalid location:', organization.name);
                        return;
                    }
                    
                    const position = {
                        lat: organization.location.latitude,
                        lng: organization.location.longitude,
                    };
                    
                    const marker = new google.maps.Marker({
                        position: position,
                        map: map,
                        title: organization.name,
                        icon: {
                            url: 'data:image/svg+xml;base64,' + btoa(\`
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#9749fa"/>
                                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                                </svg>
                            \`),
                            scaledSize: new google.maps.Size(32, 32),
                            anchor: new google.maps.Point(16, 32),
                        },
                    });
                    
                    // Add click listener for each marker (like web version)
                    marker.addListener("click", () => {
                        console.log('Marker clicked for organization:', organization.name);
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'MARKER_SELECTED',
                            organization: organization
                        }));
                    });
                    
                    markers.push(marker);
                });
                
                console.log('Created', markers.length, 'markers');
            }
            
            function setUserLocation(location) {
                console.log('Setting user location:', location);
                
                if (userLocationMarker) {
                    userLocationMarker.setMap(null);
                }
                
                userLocationMarker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: "Your Location",
                    icon: {
                        url: 'data:image/svg+xml;base64,' + btoa(\`
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="8" fill="#9749fa" stroke="white" stroke-width="3"/>
                                <circle cx="12" cy="12" r="3" fill="white"/>
                            </svg>
                        \`),
                        scaledSize: new google.maps.Size(24, 24),
                        anchor: new google.maps.Point(12, 12),
                    },
                });
                
                map.panTo(location);
                map.setZoom(8);
            }
            
            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received message:', data.type);
                    
                    switch (data.type) {
                        case 'SET_ORGANIZATIONS':
                            if (map && data.organizations) {
                                createOrganizationMarkers(data.organizations);
                            }
                            break;
                            
                        case 'SET_USER_LOCATION':
                            if (map && data.location) {
                                setUserLocation(data.location);
                            }
                            break;
                            
                        case 'ZOOM_TO_LOCATION':
                            if (map) {
                                map.setCenter({ lat: data.lat, lng: data.lng });
                                map.setZoom(data.zoom);
                            }
                            break;
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });
            
            // Initialize map when Google Maps API is loaded
            console.log('Script loaded, waiting for Google Maps API...');
        </script>
        
        <script async defer
            src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap&libraries=marker">
        </script>
    </body>
    </html>
  `;

  if (isLoading) {
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
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        allowsInlineMediaPlaybook={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(error) => console.log("WebView error:", error)}
        onHttpError={(error) => console.log("WebView HTTP error:", error)}
        onLoadStart={() => console.log("WebView started loading")}
        onLoadEnd={() => console.log("WebView finished loading")}
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

InteractiveMap.defaultProps = {
  data: [],
  style: {},
  onMapReady: null,
  onSelectItem: null,
  t: (key) => key,
};
