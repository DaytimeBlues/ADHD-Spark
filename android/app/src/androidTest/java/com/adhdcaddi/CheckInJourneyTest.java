package com.adhdcaddi;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.content.Intent;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;
import androidx.test.uiautomator.UiScrollable;
import androidx.test.uiautomator.UiSelector;
import androidx.test.uiautomator.Until;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@RunWith(AndroidJUnit4.class)
public class CheckInJourneyTest {
  private static final String TAG = "CheckInJourneyTest";

  @Rule
  public ActivityScenarioRule<MainActivity> activityRule =
      new ActivityScenarioRule<>(MainActivity.class);

  private final UiDevice device =
      UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());

  @Test
  public void previewLaunchCompletesCheckInAndShowsRecommendation() {
    String targetPackage =
        InstrumentationRegistry.getInstrumentation().getTargetContext().getPackageName();

    Log.i(TAG, "Selector strategy: UiAutomator only");
    Log.i(TAG, "Target package from instrumentation: " + targetPackage);

    relaunchApp(targetPackage);
    sleep(2_000);
    logLaunchDiagnostics("post-launch", targetPackage);

    boolean targetPackageVisible =
        device.wait(Until.hasObject(By.pkg(targetPackage).depth(0)), 10_000);
    Log.i(TAG, "UiAutomator sees target package at depth 0: " + targetPackageVisible);
    assertTrue("Did not detect target package " + targetPackage, targetPackageVisible);

    UiObject2 homeTitle = waitForHomeShell(20_000);
    if (homeTitle == null) {
      logLaunchDiagnostics("home-title-missing", targetPackage);
    }
    assertNotNull("Did not find home-title in package " + targetPackage, homeTitle);

    UiObject2 checkInEntry = waitForCheckInEntryPoint(10_000);
    if (checkInEntry == null) {
      logLaunchDiagnostics("mode-checkin-missing", targetPackage);
    }
    assertNotNull("Did not find mode-checkin in package " + targetPackage, checkInEntry);

    Log.i(TAG, "Home title bounds: " + homeTitle.getVisibleBounds());
    Log.i(TAG, "Check In entry bounds: " + checkInEntry.getVisibleBounds());

    checkInEntry.click();
    Log.i(TAG, "Tapped Check In entry point");

    UiObject2 checkInScreen = waitForCheckInScreen(10_000);
    if (checkInScreen == null) {
      logLaunchDiagnostics("checkin-screen-missing", targetPackage);
    }
    assertNotNull("Did not find Check In screen after tapping entry point", checkInScreen);
    Log.i(TAG, "Check In screen bounds: " + checkInScreen.getVisibleBounds());

    UiObject2 moodOption = waitForResource("mood-option-3", 10_000, "mood-option-3", false);
    if (moodOption == null) {
      logLaunchDiagnostics("mood-option-missing", targetPackage);
    }
    assertNotNull("Did not find mood-option-3 on Check In screen", moodOption);
    moodOption.click();
    Log.i(TAG, "Tapped mood-option-3");

    UiObject2 energyOption =
        waitForResourceOrText("energy-option-3", "MEDIUM", 10_000, "energy-option-3", true);
    if (energyOption == null) {
      logLaunchDiagnostics("energy-option-missing", targetPackage);
    }
    assertNotNull("Did not find energy-option-3 on Check In screen", energyOption);
    energyOption.click();
    Log.i(TAG, "Tapped energy-option-3");

    UiObject2 recommendationSubtitle =
        waitForResourceOrText(
            "recommendation-subtitle",
            "RECOMMENDED FOR YOU",
            10_000,
            "recommendation-subtitle",
            true);
    if (recommendationSubtitle == null) {
      logLaunchDiagnostics("recommendation-subtitle-missing", targetPackage);
    }
    assertNotNull("Did not find recommendation-subtitle after selections", recommendationSubtitle);

    UiObject2 recommendationAction =
        waitForResourceOrText(
            "recommendation-action-button",
            "OPEN BRAIN DUMP",
            10_000,
            "recommendation-action-button",
            true);
    if (recommendationAction == null) {
      logLaunchDiagnostics("recommendation-action-missing", targetPackage);
    }
    assertNotNull(
        "Did not find recommendation-action-button after selections", recommendationAction);
    Log.i(TAG, "Recommendation subtitle bounds: " + recommendationSubtitle.getVisibleBounds());
    Log.i(TAG, "Recommendation action bounds: " + recommendationAction.getVisibleBounds());
  }

  private void logLaunchDiagnostics(String stage, String targetPackage) {
    try {
      Log.i(TAG, "Diagnostics stage: " + stage);
      Log.i(TAG, "Current package from UiDevice: " + device.getCurrentPackageName());
      Log.i(
          TAG,
          "Resumed activity shell: "
              + runShellCommand(
                  "sh -c \"dumpsys activity activities | grep -E 'ResumedActivity|mFocusedActivity'\""));

      File cacheDir = InstrumentationRegistry.getInstrumentation().getTargetContext().getCacheDir();
      File hierarchyFile = new File(cacheDir, stage + "-window.xml");
      File screenshotFile = new File(cacheDir, stage + "-screen.png");
      device.dumpWindowHierarchy(hierarchyFile);
      device.takeScreenshot(screenshotFile);

      String hierarchy = readFile(hierarchyFile);
      Log.i(TAG, "Hierarchy file: " + hierarchyFile.getAbsolutePath());
      Log.i(TAG, "Screenshot file: " + screenshotFile.getAbsolutePath());
      Log.i(TAG, "Hierarchy contains target package: " + hierarchy.contains(targetPackage));
      Log.i(TAG, "Hierarchy contains home-title: " + hierarchy.contains("home-title"));
      Log.i(TAG, "Hierarchy contains mode-checkin: " + hierarchy.contains("mode-checkin"));
      Log.i(TAG, "Hierarchy preview: " + abbreviate(hierarchy, 800));
    } catch (IOException error) {
      Log.e(TAG, "Failed to capture launch diagnostics for stage " + stage, error);
    }
  }

  private void sleep(long millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException error) {
      Thread.currentThread().interrupt();
      throw new AssertionError("Interrupted while waiting for UI to settle", error);
    }
  }

  private String runShellCommand(String command) throws IOException {
    ParcelFileDescriptor descriptor =
        InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand(command);
    try (BufferedReader reader =
        new BufferedReader(
            new InputStreamReader(new FileInputStream(descriptor.getFileDescriptor()), StandardCharsets.UTF_8))) {
      StringBuilder output = new StringBuilder();
      String line;
      while ((line = reader.readLine()) != null) {
        output.append(line).append('\n');
      }
      return output.toString().trim();
    } finally {
      descriptor.close();
    }
  }

  private String readFile(File file) throws IOException {
    try (FileInputStream input = new FileInputStream(file)) {
      return new String(input.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  private String abbreviate(String value, int maxLength) {
    if (value.length() <= maxLength) {
      return value;
    }
    return value.substring(0, maxLength) + "...";
  }

  private UiObject2 waitForHomeShell(long timeoutMs) {
    long deadline = System.currentTimeMillis() + timeoutMs;
    while (System.currentTimeMillis() < deadline) {
      UiObject2 byDesc = device.findObject(By.desc("home-title"));
      if (byDesc != null) {
        Log.i(TAG, "Matched home shell via content-desc home-title");
        return byDesc;
      }

      UiObject2 byRes = device.findObject(By.res("home-title"));
      if (byRes != null) {
        Log.i(TAG, "Matched home shell via resource-id home-title");
        return byRes;
      }

      sleep(250);
    }

    return null;
  }

  private UiObject2 waitForCheckInEntryPoint(long timeoutMs) {
    long deadline = System.currentTimeMillis() + timeoutMs;
    while (System.currentTimeMillis() < deadline) {
      UiObject2 byDesc = device.findObject(By.desc("Check In mode"));
      if (byDesc != null) {
        Log.i(TAG, "Matched Check In entry via content-desc Check In mode");
        return byDesc;
      }

      UiObject2 byRes = device.findObject(By.res("mode-checkin"));
      if (byRes != null) {
        Log.i(TAG, "Matched Check In entry via resource-id mode-checkin");
        return byRes;
      }

      sleep(250);
    }

    return null;
  }

  private UiObject2 waitForCheckInScreen(long timeoutMs) {
    long deadline = System.currentTimeMillis() + timeoutMs;
    while (System.currentTimeMillis() < deadline) {
      UiObject2 byDesc = device.findObject(By.desc("Check-in screen"));
      if (byDesc != null) {
        Log.i(TAG, "Matched Check In screen via content-desc Check-in screen");
        return byDesc;
      }

      UiObject2 byRes = device.findObject(By.res("checkin-subtitle"));
      if (byRes != null) {
        Log.i(TAG, "Matched Check In screen via resource-id checkin-subtitle");
        return byRes;
      }

      UiObject2 byText = device.findObject(By.text("HOW ARE YOU FEELING RIGHT NOW?"));
      if (byText != null) {
        Log.i(TAG, "Matched Check In screen via subtitle text");
        return byText;
      }

      sleep(250);
    }

    return null;
  }

  private UiObject2 waitForResource(
      String resourceName, long timeoutMs, String label, boolean allowScroll) {
    return waitForResourceOrText(resourceName, null, timeoutMs, label, allowScroll);
  }

  private UiObject2 waitForResourceOrText(
      String resourceName, String text, long timeoutMs, String label, boolean allowScroll) {
    long deadline = System.currentTimeMillis() + timeoutMs;
    boolean scrollAttempted = false;
    while (System.currentTimeMillis() < deadline) {
      UiObject2 byRes = device.findObject(By.res(resourceName));
      if (byRes != null) {
        Log.i(TAG, "Matched " + label + " via resource-id " + resourceName);
        return byRes;
      }

      if (text != null) {
        UiObject2 byText = device.findObject(By.text(text));
        if (byText != null) {
          Log.i(TAG, "Matched " + label + " via text " + text);
          return byText;
        }
      }

      if (allowScroll && !scrollAttempted) {
        UiObject2 scrolledIntoView = scrollIntoView(resourceName, text, label);
        if (scrolledIntoView != null) {
          return scrolledIntoView;
        }
        scrollAttempted = true;
      }

      sleep(250);
    }

    return null;
  }

  private UiObject2 scrollIntoView(String resourceName, String text, String label) {
    try {
      UiScrollable scrollable = new UiScrollable(new UiSelector().scrollable(true).instance(0));
      scrollable.setAsVerticalList();

      if (resourceName != null) {
        boolean foundByResource =
            scrollable.scrollIntoView(
                new UiSelector().resourceIdMatches(".*" + resourceName));
        if (foundByResource) {
          UiObject2 byRes = device.findObject(By.res(resourceName));
          if (byRes != null) {
            Log.i(TAG, "Scrolled into view for " + label + " via resource-id " + resourceName);
            return byRes;
          }
        }
      }

      if (text != null) {
        boolean foundByText = scrollable.scrollIntoView(new UiSelector().text(text));
        if (foundByText) {
          UiObject2 byText = device.findObject(By.text(text));
          if (byText != null) {
            Log.i(TAG, "Scrolled into view for " + label + " via text " + text);
            return byText;
          }
        }
      }
    } catch (Exception error) {
      Log.w(TAG, "UiScrollable failed while looking for " + label, error);
    }

    device.swipe(540, 1900, 540, 900, 20);
    Log.i(TAG, "Fallback swipe while looking for " + label);
    sleep(500);
    return null;
  }

  private void relaunchApp(String targetPackage) {
    Intent launchIntent =
        InstrumentationRegistry.getInstrumentation()
            .getTargetContext()
            .getPackageManager()
            .getLaunchIntentForPackage(targetPackage);
    assertNotNull("Launch intent not found for target package " + targetPackage, launchIntent);
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    InstrumentationRegistry.getInstrumentation().getTargetContext().startActivity(launchIntent);
    Log.i(TAG, "Requested app launch for package: " + targetPackage);
  }
}
