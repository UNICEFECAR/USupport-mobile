package org.unicef.ecar.usupport;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.security.ProviderInstaller;

import expo.modules.ReactActivityDelegateWrapper;

public class MainActivity extends ReactActivity
      implements ProviderInstaller.ProviderInstallListener	 {

  private static final int ERROR_DIALOG_REQUEST_CODE = 1;
  private boolean retryProviderInstall;
      

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support 
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(null);
    ProviderInstaller.installIfNeededAsync(this, this);
  }

    /**
   * This method is called if updating fails. The error code indicates
   * whether the error is recoverable.
   */
  public void onProviderInstallFailed(int errorCode, Intent recoveryIntent) {
    GoogleApiAvailability availability = GoogleApiAvailability.getInstance();
    if (availability.isUserResolvableError(errorCode)) {
      // Recoverable error. Show a dialog prompting the user to
      // install/update/enable Google Play services.
      availability.showErrorDialogFragment(
          this,
          errorCode,
          ERROR_DIALOG_REQUEST_CODE,
          new DialogInterface.OnCancelListener() {
            @Override
            public void onCancel(DialogInterface dialog) {
              // The user chose not to take the recovery action.
              onProviderInstallerNotAvailable();
            }
          });
    } else {
      // Google Play services isn't available.
      onProviderInstallerNotAvailable();
    }
  }

  @Override
  public void onProviderInstalled() {
      // Handle the success of the provider installation
      // You might not need to do anything here, but the method must exist.
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode,
      Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == ERROR_DIALOG_REQUEST_CODE) {
      // Adding a fragment via GoogleApiAvailability.showErrorDialogFragment
      // before the instance state is restored throws an error. So instead,
      // set a flag here, which causes the fragment to delay until
      // onPostResume.
      retryProviderInstall = true;
    }
  }

    /**
  * On resume, check whether a flag indicates that the provider needs to be
  * reinstalled.
  */
  @Override
  protected void onPostResume() {
    super.onPostResume();
    if (retryProviderInstall) {
      // It's safe to retry installation.
      ProviderInstaller.installIfNeededAsync(this, this);
    }
    retryProviderInstall = false;
  }

  private void onProviderInstallerNotAvailable() {
    // This is reached if the provider can't be updated for some reason.
    AlertDialog.Builder builder = new AlertDialog.Builder(this);
    builder.setTitle(getString(R.string.provider_install_failed_title));
    builder.setMessage(getString(R.string.provider_install_failed_message));

    builder.setPositiveButton(getString(R.string.ok_button), new DialogInterface.OnClickListener() {
        @Override
        public void onClick(DialogInterface dialog, int which) {
        // User clicked OK button.
        finish(); // Close the app or navigate accordingly
        }
    });

    // Create and show the AlertDialog
    AlertDialog dialog = builder.create();
    dialog.show();
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      new MainActivityDelegate(this, getMainComponentName())
    );
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }
}
