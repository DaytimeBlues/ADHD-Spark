import fs from 'fs';
import path from 'path';

const readDoc = (name: string) =>
  fs.readFileSync(path.join(__dirname, '..', 'docs', name), 'utf8');

describe('Android APK-ready docs contract', () => {
  test('release process defines CI release smoke and sideload release distinctly', () => {
    const releaseProcess = readDoc('RELEASE_PROCESS.md');

    expect(releaseProcess).toContain('Android Release Status');
    expect(releaseProcess).toContain('CI release smoke');
    expect(releaseProcess).toContain('sideload release');
    expect(releaseProcess).toContain('not a production-signed artifact');
    expect(releaseProcess).toContain('keystore-signed APK');
  });

  test('tech spec states Android APK-ready as the bounded release scope', () => {
    const techSpec = readDoc('TECH_SPEC.md');

    expect(techSpec).toContain('APK-ready');
    expect(techSpec).toContain('Current Android release source of truth');
    expect(techSpec).toContain('CI release smoke');
    expect(techSpec).toContain('sideload release');
  });

  test('android audit records the required checklist and separates phase-two work', () => {
    const auditPath = path.join(
      __dirname,
      '..',
      'docs',
      'ANDROID_AUDIT_2026-03-09.md',
    );

    expect(fs.existsSync(auditPath)).toBe(true);

    const audit = fs.readFileSync(auditPath, 'utf8');
    expect(audit).toContain('Android Release Checklist');
    expect(audit).toContain('read current Android audit');
    expect(audit).toContain('inspect latest Android CI run');
    expect(audit).toContain('run local health checks if touching native code');
    expect(audit).toContain('update the audit after changes');
    expect(audit).toContain('Phase 2: Non-APK Work');
  });

  test('test matrix includes the Android APK-ready acceptance bar', () => {
    const testMatrix = readDoc('TEST_MATRIX.md');

    expect(testMatrix).toContain('Android APK-Ready Acceptance');
    expect(testMatrix).toContain('Clean install launch');
    expect(testMatrix).toContain('Returning-user local data launch');
    expect(testMatrix).toContain(
      'No-signal launch degrades gracefully without PWA assumptions',
    );
    expect(testMatrix).toContain('Tutorial visibility');
    expect(testMatrix).toContain('Capture entry');
    expect(testMatrix).toContain('Tab navigation survivability');
  });
});
