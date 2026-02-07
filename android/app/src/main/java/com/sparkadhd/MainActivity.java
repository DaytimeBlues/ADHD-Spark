package com.sparkadhd;

import static com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

public class MainActivity extends ReactActivity {
  @Override
  protected String getMainComponentName() {
    return "SparkADHD";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      fabricEnabled);
  }
}
