# USupport Mobile App

Importing and Running USupport mobile project in Android Studio and Xcode

1. Clone the project with one of the following commands:

```sh
git clone https://github.com/UNICEFECAR/USupport-mobile.git
```

or

```sh
git clone git@github.com:UNICEFECAR/USupport-mobile.git
```

2. Enter in the project folder and run

```sh
npm install
```

to install all the dependencies.

3. Configure Firebase services

   - [Create Firebase project](https://console.firebase.google.com/)
   - Add Android and iOS apps to the Firebase project and download the respective `google-services.json` and `GoogleService-Info.plist` files
   - Add the files to the project in the following locations:
     - `android/app/google-services.json`
     - `ios/GoogleService-Info.plist`

4. Open the `.env.sample` and copy it's contents.

5. Create an `.env.development` file in the root directory of the project and paste the enviorment variables that you copied in the previous step. If you dont have the backend running, you can use the enviorment variables for the staging backend.

```sh
API_URL_ENDPOINT=https://staging.usupport.online/api
CMS_API_URL_ENDPOINT=https://staging.usupport.online/cms/api
AMAZON_S3_BUCKET=https://usupport-staging.s3.eu-central-1.amazonaws.com
WEBSITE_URL=https://staging.usupport.online
SOCKET_IO_URL=wss://staging.usupport.online
STRIPE_PUBLIC_KEY=pk_test_51MPzPVEFe7qoLe5D8bfwXpGuYvL0I98ui3P2lfM1cWoG1b0oRU8GfXBzWnXMrivdRwR7gXXngkjiNxm85PXv4B1400jL8VhSUh
```

If you are running the backend locally, then you need to add the `AMAZON_S3_BUCKET` url of the S3 bucket you created and the `STRIPE_PUBLIC_KEY` of the Stripe account you created.
The API_URL_ENDPOINT and CMS_API_URL_ENDPOINT should be `https` and not `http`, you can use [ngrok](https://ngrok.com/) to create a secure tunnel to your localhost. For reference use the below example

```sh
API_URL_ENDPOINT=https://<ngrok-url>.ngrok.io/api
CMS_API_URL_ENDPOINT=https://<ngrok-url>.ngrok.io/cms/api
AMAZON_S3_BUCKET=https://<bucket-name>.s3.eu-central-1.amazonaws.com
WEBSITE_URL=https://<ngrok-url>.ngrok.io
SOCKET_IO_URL=wss://<ngrok-url>.ngrok.io
STRIPE_PUBLIC_KEY=pk_test_51MPzPVEFe7qoLe5D8bfwXpGuYvL0I98ui3P2lfM1cWoG1b0oRU8GfXBzWnXMrivdRwR7gXXngkjiNxm85PXv4B1400jL8VhSUh
```

The CODEPUSH_ANDROID_DEPLOYMENT_KEY and CODEPUSH_IOS_DEPLOYMENT_KEY enviorment variables are used for over-the-air updates, which is not required for local development. You can leave them empty or with the placeholder value.

6. Install the Expo CLI globally:

```sh
npm install -g expo-cli
```

7. Run the following command to start the development server:

```sh
npm start
```

# Android

1. Install Android Studio: Make sure you have Android Studio installed on your system. You can download it from the official website and follow the installation instructions.

- [Download Android Studio](https://developer.android.com/studio)

2. Launch Android Studio on your system.

3. Import the project: In Android Studio, select "Open an existing Android Studio project" from the welcome screen. Navigate to the root directory of the project and open the `android` folder. Android Studio will import the project.

4. Gradle Sync: Android Studio will start syncing the project with Gradle. Wait for the syncing process to complete. This might take a few minutes, as Android Studio downloads the necessary dependencies.

5. Configure Android SDK: Make sure you have the required Android SDK installed. If prompted, follow the on-screen instructions to download and install the necessary SDK components.

   - [Android SDK Setup](https://developer.android.com/studio/intro/update#sdk-manager)

6. Once the project is successfully imported and synced, you can run it by selecting a target device or emulator from the toolbar and clicking on the "Run" button. Android Studio will build the project and launch it on the selected device or emulator.

7. In case you get an error "Unable to load script.Make sure you are either running a Metro server or that your bundle 'index.android.bundle' is packaged correctly for release", run the following command in the terminal:

```sh
adb reverse tcp:8081 tcp:8081
```

If you get an error saying "adb: command not found", make sure you have adb installed on your system and that it is added to your PATH environment variable. [More Info](https://medium.com/androiddevelopers/help-adb-is-not-found-93e9ed8a67ee)

# Useful links

- [Java OpenJDK ](https://www.azul.com/downloads/?package=jdk#zulu)

# iOS

1. Make sure you have Xcode and cocoapods installed on your system. You can download it from the Mac App Store or the Apple Developer website. Note that an Apple Developer account is required to setup all the necessary certificates and provisioning profiles for running the project on a physical device. Running the project on the iOS Simulator does not require a paid Apple Developer account.

- [Download Xcode](https://developer.apple.com/xcode/)
- install cocoapods

```sh
sudo gem install cocoapods
```

2. In a terminal run the following command:

```sh
npx pod-install
```

3. Launch the Xcode app.

4. Open the project: In Xcode, select "Open another project" or "Open a project or file" from the welcome screen. Navigate to the root directory of the project and select the `USupport.xcworkspace` file. Xcode will then open the project.

5. From the scheme dropdown in the toolbar(located in the top middle), open the dropdown and select the "USupport Dev" scheme.

6. Next to the scheme dropdown, open the simulators dropdown and select a simulator or a physical device to run the project on.

7. Click on the "Run" button or press Command+R to build and run the project. Xcode will compile the project, launch the chosen device or simulator, and deploy the React Native app onto it.
