# ADHD-CADDI Android MASVS Audit

Date: 2026-03-09

## Executive Summary

This Android review is a lightweight `OWASP MASVS`-style audit based on the app manifest, Gradle config, network security config, and custom native overlay code. The Android surface is relatively small, which is good, but there are still a few meaningful findings around backup posture, release transport policy, and privileged overlay capabilities.

Current Android security posture: `5.8/10`

Main positives:

- only the launcher activity is exported
- the overlay service is marked `android:exported="false"`
- release minification is enabled
- the native overlay module is small and does not expose obvious token-handling logic

Main concerns:

- app backups are globally enabled without visible scoping rules
- cleartext exceptions are present in the shipped network security config
- the app uses high-risk overlay permissions, so release governance around that feature needs to stay explicit and documented

## Findings

### MASVS-001

Severity:
- High

Area:
- Storage / local data exposure

Location:
- [AndroidManifest.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/AndroidManifest.xml#L14)

Evidence:

```xml
<application ... android:allowBackup="true" ...>
```

Impact:
- Android backup/restore is globally enabled, but there is no visible `fullBackupContent` or `dataExtractionRules` policy in the manifest or resources. That means app data can be included in backup flows more broadly than intended. For an app that stores mental-health-adjacent notes, tasks, and check-in state, that is a real privacy concern.

Why it matters:
- In plain terms, backup settings decide whether Android is allowed to copy app data off the device. If that is turned on without a rule file, you are trusting the platform default instead of explicitly saying what is safe to copy.

Recommended fix:
- Default to `android:allowBackup="false"` unless you have a documented restore requirement.
- If backup must stay enabled, add explicit `fullBackupContent` and `dataExtractionRules` files and exclude sensitive app state.

### MASVS-002

Severity:
- Medium

Area:
- Network transport security

Location:
- [AndroidManifest.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/AndroidManifest.xml#L14)
- [network_security_config.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/res/xml/network_security_config.xml#L1)

Evidence:

```xml
<application ... android:networkSecurityConfig="@xml/network_security_config" ...>
```

```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

Impact:
- The release app still ships with a cleartext exception config, even though it is limited to local development hosts. That is lower risk than allowing arbitrary cleartext traffic, but it still means the production manifest is carrying a dev transport exception instead of a debug-only one.

Why it matters:
- A secure mobile release should make the safe thing the default. Development exceptions are normal, but they should usually live in debug-only resources or build variants so they cannot accidentally leak into release behavior later.

Recommended fix:
- Move the cleartext exception to a debug-only manifest/resource overlay, or gate it with build-variant-specific network security config.

### MASVS-003

Severity:
- Medium

Area:
- Platform interaction / privileged capability

Location:
- [AndroidManifest.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/AndroidManifest.xml#L10)
- [AndroidManifest.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/AndroidManifest.xml#L25)
- [OverlayModule.java](/C:/dev/ADHD-CADDI-V1/android/app/src/main/java/com/adhdcaddi/OverlayModule.java#L126)
- [OverlayService.java](/C:/dev/ADHD-CADDI-V1/android/app/src/main/java/com/adhdcaddi/OverlayService.java#L145)

Evidence:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

```xml
<service android:name=".OverlayService" android:exported="false" android:foregroundServiceType="specialUse">
```

Impact:
- `SYSTEM_ALERT_WINDOW` plus a foreground overlay service is an intentionally high-privilege feature. The implementation is not obviously unsafe by itself, but this permission tier deserves explicit release review because overlays can affect user trust, accessibility, and abuse potential if behavior ever expands.

Why it matters:
- This is not "remove the feature." It means the feature should be treated as sensitive infrastructure, not just another convenience widget.

Recommended fix:
- Keep the permission, but document the user-consent and runtime boundaries clearly.
- Add release checks that confirm the overlay can only be started through the intended user flow.
- Consider a short threat-model note for the overlay feature in docs.

### MASVS-004

Severity:
- Low

Area:
- Release controls / operational security

Location:
- [build.gradle](/C:/dev/ADHD-CADDI-V1/android/app/build.gradle#L55)

Evidence:

```gradle
release {
    // CI release checks can disable signing and use debug key for packaging.
    signingConfig useReleaseSigning ? signingConfigs.release : signingConfigs.debug
    minifyEnabled true
}
```

Impact:
- This is acceptable for CI smoke packaging, but it creates a footgun if anyone ever mistakes a CI-packaged release artifact for a production-signed release artifact.

Why it matters:
- A release build and a production release are not the same thing. The code is already trying to separate them, but the distinction should stay very obvious.

Recommended fix:
- Keep this flow for CI if needed, but ensure release publishing cannot proceed unless the real keystore variables are present.
- Label CI artifacts clearly as non-production release checks.

## Positive Notes

- [AndroidManifest.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/AndroidManifest.xml#L25): the overlay service is not exported.
- [AndroidManifest.xml](/C:/dev/ADHD-CADDI-V1/android/app/src/main/AndroidManifest.xml#L16): the main activity is exported only for launcher use.
- [build.gradle](/C:/dev/ADHD-CADDI-V1/android/app/build.gradle#L58): release minification is enabled.

## Recommended Fix Order

1. Turn off unrestricted backup behavior or add explicit backup/data-extraction rules.
2. Move cleartext localhost exceptions into debug-only Android config.
3. Keep overlay capability, but document and test its trust boundaries more explicitly.
4. Keep CI release signing fallback clearly separated from real release publishing.

## Verification Checklist

- `./gradlew assembleRelease`
- verify release manifest no longer enables unintended backup behavior
- verify release manifest does not ship dev-only cleartext exceptions
- rerun Android CI release launch verification on `main`
