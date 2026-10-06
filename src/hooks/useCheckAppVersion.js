import { useEffect } from "react";
import { AppState, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { useQuery } from "@tanstack/react-query";
import { appVersionSvc } from "#services";

/**
 * Asks the backend whether the installed app version needs an update.
 * Re-checks every time the app comes back to the foreground.
 *
 * @returns query with data: { updateType: "none" | "optional" | "forced", latestVersion, storeUrl, releaseNotes }
 */
export default function useCheckAppVersion() {
  const checkAppVersion = async () => {
    const { data } = await appVersionSvc.getAppVersionStatus({
      platform: Platform.OS,
      version: DeviceInfo.getVersion(),
    });
    return data;
  };

  const query = useQuery(["app-version"], checkAppVersion, {
    refetchInterval: false,
    retry: false,
  });

  const { refetch } = query;
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refetch();
    });
    return () => subscription.remove();
  }, [refetch]);

  return query;
}

export { useCheckAppVersion };
