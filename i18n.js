import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  ActivityHistory,
  Articles,
  ArticlesDashboard,
  ChangePasscode,
  Consultations,
  ConsultationsDashboard,
  ContactUs,
  FAQ,
  ForgotPassword,
  GiveSuggestion,
  InformationalPortal,
  Login,
  MoodTracker,
  NotificationPreferences,
  Notifications,
  Passcode,
  PaymentHistory,
  PlatformRating,
  PrivacyPolicy,
  ProviderOverview,
  RegisterAboutYou,
  RegisterAnonymous,
  RegisterEmail,
  RegisterPreview,
  RegisterSupport,
  SafetyFeedback,
  SelectProvider,
  SharePlatform,
  SOSCenter,
  TermsOfUse,
  UserDetails,
  UserProfile,
  Welcome,
  MoodTrackHistory,
  MyQA,
} from "./src/blocks/locales.js";

import {
  ArticleInformation,
  Articles as ArticlesScreen,
  ChangePasscode as ChangePasscodeScreen,
  Checkout as CheckoutPage,
  Consultation as ConsultationScreen,
  Consultations as ConsultationsScreen,
  Dashboard,
  FAQ as FAQPage,
  ForgotPassword as ForgotPasswordScreen,
  InformationalPortal as InformationalPortalScreen,
  MoodTracker as MoodTrackerScreen,
  NotificationPreferences as NotificationPreferencesScreen,
  Passcode as PasscodeScreen,
  PaymentHistory as PaymentHistoryScreen,
  PlatformRating as PlatformRatingScreen,
  ProviderOverview as ProviderOverviewScreen,
  SafetyFeedback as SafetyFeedbackScreen,
  SelectProvider as SelectProviderScreen,
  SharePlatform as SharePlatformScreen,
  SOSCenter as SOSCenterScreen,
  LocalAuthenticationScreen,
  MyQA as MyQAScreen,
} from "./src/screens/locales.js";

import {
  CancelConsultation,
  ChangePassword,
  ConfirmConsultation,
  DeleteAccount,
  DeleteProfilePicture,
  EditConsultation,
  FilterProviders,
  JoinConsultation,
  SelectAvatar,
  SelectConsultation,
  CreateQuestion,
  QuestionDetails,
  FilterQuestions,
  CodeVerification,
  ArticleCategories,
} from "./src/backdrops/locales.js";

import {
  MoodTrackerMoreInformation,
  PaymentInformation,
  RequireDataAgreemant,
  RequireRegistration,
  HowItWorksMyQA,
} from "./src/modals/locales.js";

import { TabNavigation } from "./src/navigation/locales.js";

const resources = {
  en: {
    // Blocks
    "change-passcode": ChangePasscode.en,
    "consultations-dashboard": ConsultationsDashboard.en,
    consultations: Consultations.en,
    "contact-us-block": ContactUs.en,
    faq: FAQ.en,
    "forgot-password": ForgotPassword.en,
    login: Login.en,
    "mood-tracker": MoodTracker.en,
    "notification-preferences": NotificationPreferences.en,
    notifications: Notifications.en,
    passcode: Passcode.en,
    "payment-history": PaymentHistory.en,
    "platform-rating": PlatformRating.en,
    "privacy-policy": PrivacyPolicy.en,
    "provider-overview": ProviderOverview.en,
    "register-about-you": RegisterAboutYou.en,
    "register-anonymous": RegisterAnonymous.en,
    "register-email": RegisterEmail.en,
    "register-preview": RegisterPreview.en,
    "register-support": RegisterSupport.en,
    "safety-feedback": SafetyFeedback.en,
    "select-provider": SelectProvider.en,
    "share-platform": SharePlatform.en,
    "sos-center": SOSCenter.en,
    "terms-of-use": TermsOfUse.en,
    "user-details": UserDetails.en,
    "user-profile": UserProfile.en,
    welcome: Welcome.en,
    "mood-track-history": MoodTrackHistory.en,
    "my-qa": MyQA.en,

    // Screens
    "activity-history": ActivityHistory.en,
    "article-information": ArticleInformation.en,
    "articles-dashboard": ArticlesDashboard.en,
    "articles-screen": ArticlesScreen.en,
    articles: Articles.en,
    "change-passcode-screen": ChangePasscodeScreen.en,
    "checkout-page": CheckoutPage.en,
    "consultation-page": ConsultationScreen.en,
    "consultations-screen": ConsultationsScreen.en,
    dashboard: Dashboard.en,
    "faq-page": FAQPage.en,
    "forgot-password-screen": ForgotPasswordScreen.en,
    "give-suggestion": GiveSuggestion.en,
    "information-portal": InformationalPortal.en,
    "informational-portal-screen": InformationalPortalScreen.en,
    "local-authentication-screen": LocalAuthenticationScreen.en,
    "mood-tracker-screen": MoodTrackerScreen.en,
    "notification-preferences-screen": NotificationPreferencesScreen.en,
    "passcode-screen": PasscodeScreen.en,
    "payment-history-screen": PaymentHistoryScreen.en,
    "platfrom-rating-screen": PlatformRatingScreen.en,
    "provider-overview-scren": ProviderOverviewScreen.en,
    "safety-feedback-screen": SafetyFeedbackScreen.en,
    "select-provider-screen": SelectProviderScreen.en,
    "share-platform-screen": SharePlatformScreen.en,
    "sos-center-screen": SOSCenterScreen.en,
    "my-qa-screen": MyQAScreen.en,

    // Backdrops
    "cancel-consultation": CancelConsultation.en,
    "change-password": ChangePassword.en,
    "confirm-consultation": ConfirmConsultation.en,
    "delete-account": DeleteAccount.en,
    "delete-profile-picture": DeleteProfilePicture.en,
    "edit-consultation": EditConsultation.en,
    "filter-providers": FilterProviders.en,
    "join-consultation": JoinConsultation.en,
    "select-avatar": SelectAvatar.en,
    "select-consultation": SelectConsultation.en,
    "create-question": CreateQuestion.en,
    "question-details": QuestionDetails.en,
    "filter-questions": FilterQuestions.en,
    "code-verification": CodeVerification.en,
    "article-categories": ArticleCategories.en,

    // Modals
    "mood-tracker-more-information": MoodTrackerMoreInformation.en,
    "payment-information": PaymentInformation.en,
    "require-data-agreement": RequireDataAgreemant.en,
    "require-registration": RequireRegistration.en,
    "how-it-works-my-qa": HowItWorksMyQA.en,

    // Navigation
    "tab-navigation": TabNavigation.en,
  },

  ru: {
    // Blocks
    "change-passcode": ChangePasscode.ru,
    "consultations-dashboard": ConsultationsDashboard.ru,
    consultations: Consultations.ru,
    "contact-us-block": ContactUs.ru,
    faq: FAQ.ru,
    "forgot-password": ForgotPassword.ru,
    login: Login.ru,
    "mood-tracker": MoodTracker.ru,
    "notification-preferences": NotificationPreferences.ru,
    notifications: Notifications.ru,
    passcode: Passcode.ru,
    "payment-history": PaymentHistory.ru,
    "platform-rating": PlatformRating.ru,
    "privacy-policy": PrivacyPolicy.ru,
    "provider-overview": ProviderOverview.ru,
    "register-about-you": RegisterAboutYou.ru,
    "register-anonymous": RegisterAnonymous.ru,
    "register-email": RegisterEmail.ru,
    "register-preview": RegisterPreview.ru,
    "register-support": RegisterSupport.ru,
    "safety-feedback": SafetyFeedback.ru,
    "select-provider": SelectProvider.ru,
    "share-platform": SharePlatform.ru,
    "sos-center": SOSCenter.ru,
    "terms-of-use": TermsOfUse.ru,
    "user-details": UserDetails.ru,
    "user-profile": UserProfile.ru,
    welcome: Welcome.ru,
    "mood-track-history": MoodTrackHistory.ru,
    "my-qa": MyQA.ru,

    // Screens
    "activity-history": ActivityHistory.ru,
    "article-information": ArticleInformation.ru,
    "articles-dashboard": ArticlesDashboard.ru,
    "articles-screen": ArticlesScreen.ru,
    articles: Articles.ru,
    "change-passcode-screen": ChangePasscodeScreen.ru,
    "checkout-page": CheckoutPage.ru,
    "consultation-page": ConsultationScreen.ru,
    "consultations-screen": ConsultationsScreen.ru,
    dashboard: Dashboard.ru,
    "faq-page": FAQPage.ru,
    "forgot-password-screen": ForgotPasswordScreen.ru,
    "give-suggestion": GiveSuggestion.ru,
    "information-portal": InformationalPortal.ru,
    "informational-portal-screen": InformationalPortalScreen.ru,
    "local-authentication-screen": LocalAuthenticationScreen.ru,
    "mood-tracker-screen": MoodTrackerScreen.ru,
    "notification-preferences-screen": NotificationPreferencesScreen.ru,
    "passcode-screen": PasscodeScreen.ru,
    "payment-history-screen": PaymentHistoryScreen.ru,
    "platfrom-rating-screen": PlatformRatingScreen.ru,
    "provider-overview-scren": ProviderOverviewScreen.ru,
    "safety-feedback-screen": SafetyFeedbackScreen.ru,
    "select-provider-screen": SelectProviderScreen.ru,
    "share-platform-screen": SharePlatformScreen.ru,
    "sos-center-screen": SOSCenterScreen.ru,
    "my-qa-screen": MyQAScreen.ru,

    // Backdrops
    "cancel-consultation": CancelConsultation.ru,
    "change-password": ChangePassword.ru,
    "confirm-consultation": ConfirmConsultation.ru,
    "delete-account": DeleteAccount.ru,
    "delete-profile-picture": DeleteProfilePicture.ru,
    "edit-consultation": EditConsultation.ru,
    "filter-providers": FilterProviders.ru,
    "join-consultation": JoinConsultation.ru,
    "select-avatar": SelectAvatar.ru,
    "select-consultation": SelectConsultation.ru,
    "create-question": CreateQuestion.ru,
    "question-details": QuestionDetails.ru,
    "filter-questions": FilterQuestions.ru,
    "code-verification": CodeVerification.ru,
    "article-categories": ArticleCategories.ru,

    // Modals
    "mood-tracker-more-information": MoodTrackerMoreInformation.ru,
    "payment-information": PaymentInformation.ru,
    "require-data-agreement": RequireDataAgreemant.ru,
    "require-registration": RequireRegistration.ru,
    "how-it-works-my-qa": HowItWorksMyQA.ru,

    // Navigation
    "tab-navigation": TabNavigation.ru,
  },

  kk: {
    // Blocks
    "change-passcode": ChangePasscode.kk,
    "consultations-dashboard": ConsultationsDashboard.kk,
    consultations: Consultations.kk,
    "contact-us-block": ContactUs.kk,
    faq: FAQ.kk,
    "forgot-password": ForgotPassword.kk,
    login: Login.kk,
    "mood-tracker": MoodTracker.kk,
    "notification-preferences": NotificationPreferences.kk,
    notifications: Notifications.kk,
    passcode: Passcode.kk,
    "payment-history": PaymentHistory.kk,
    "platform-rating": PlatformRating.kk,
    "privacy-policy": PrivacyPolicy.kk,
    "provider-overview": ProviderOverview.kk,
    "register-about-you": RegisterAboutYou.kk,
    "register-anonymous": RegisterAnonymous.kk,
    "register-email": RegisterEmail.kk,
    "register-preview": RegisterPreview.kk,
    "register-support": RegisterSupport.kk,
    "safety-feedback": SafetyFeedback.kk,
    "select-provider": SelectProvider.kk,
    "share-platform": SharePlatform.kk,
    "sos-center": SOSCenter.kk,
    "terms-of-use": TermsOfUse.kk,
    "user-details": UserDetails.kk,
    "user-profile": UserProfile.kk,
    welcome: Welcome.kk,
    "mood-track-history": MoodTrackHistory.kk,
    "my-qa": MyQA.kk,

    // Screens
    "activity-history": ActivityHistory.kk,
    "article-information": ArticleInformation.kk,
    "articles-dashboard": ArticlesDashboard.kk,
    "articles-screen": ArticlesScreen.kk,
    articles: Articles.kk,
    "change-passcode-screen": ChangePasscodeScreen.kk,
    "checkout-page": CheckoutPage.kk,
    "consultation-page": ConsultationScreen.kk,
    "consultations-screen": ConsultationsScreen.kk,
    dashboard: Dashboard.kk,
    "faq-page": FAQPage.kk,
    "forgot-password-screen": ForgotPasswordScreen.kk,
    "give-suggestion": GiveSuggestion.kk,
    "information-portal": InformationalPortal.kk,
    "informational-portal-screen": InformationalPortalScreen.kk,
    "local-authentication-screen": LocalAuthenticationScreen.kk,
    "mood-tracker-screen": MoodTrackerScreen.kk,
    "notification-preferences-screen": NotificationPreferencesScreen.kk,
    "passcode-screen": PasscodeScreen.kk,
    "payment-history-screen": PaymentHistoryScreen.kk,
    "platfrom-rating-screen": PlatformRatingScreen.kk,
    "provider-overview-scren": ProviderOverviewScreen.kk,
    "safety-feedback-screen": SafetyFeedbackScreen.kk,
    "select-provider-screen": SelectProviderScreen.kk,
    "share-platform-screen": SharePlatformScreen.kk,
    "sos-center-screen": SOSCenterScreen.kk,
    "my-qa-screen": MyQAScreen.kk,

    // Backdrops
    "cancel-consultation": CancelConsultation.kk,
    "change-password": ChangePassword.kk,
    "confirm-consultation": ConfirmConsultation.kk,
    "delete-account": DeleteAccount.kk,
    "delete-profile-picture": DeleteProfilePicture.kk,
    "edit-consultation": EditConsultation.kk,
    "filter-providers": FilterProviders.kk,
    "join-consultation": JoinConsultation.kk,
    "select-avatar": SelectAvatar.kk,
    "select-consultation": SelectConsultation.kk,
    "create-question": CreateQuestion.kk,
    "question-details": QuestionDetails.kk,
    "filter-questions": FilterQuestions.kk,
    "code-verification": CodeVerification.kk,
    "article-categories": ArticleCategories.kk,

    // Modals
    "mood-tracker-more-information": MoodTrackerMoreInformation.kk,
    "payment-information": PaymentInformation.kk,
    "require-data-agreement": RequireDataAgreemant.kk,
    "require-registration": RequireRegistration.kk,
    "how-it-works-my-qa": HowItWorksMyQA.kk,

    // Navigation
    "tab-navigation": TabNavigation.kk,
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
