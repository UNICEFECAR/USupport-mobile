import { getApp } from "@react-native-firebase/app";
import { crash, getCrashlytics } from "@react-native-firebase/crashlytics";

let app = getApp();

export const crashlytics = getCrashlytics(app);
crashlytics.sendUnsentReports();
const isEnabled = crashlytics.isCrashlyticsCollectionEnabled;
if (!isEnabled) {
  crashlytics.setCrashlyticsCollectionEnabled(true);
}

export const triggerCrash = async () => {
  crash();
};

export const addLog = (data) => {
  crashlytics.log(data);
};
