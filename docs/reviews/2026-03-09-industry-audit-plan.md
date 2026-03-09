# ADHD-CADDI Industry Audit Plan

Date: 2026-03-09

## Executive Summary

This repo should be audited with a small set of established frameworks instead of one vague "quality score." For ADHD-CADDI, the right stack is:

- `OWASP ASVS` for web and browser-facing behavior
- `OWASP MASVS` for Android/mobile security
- `NIST SSDF` plus `SLSA-lite` for CI, release, and supply-chain trust
- a repo-specific "product truth" audit to verify docs, deploys, and smoke tests match real runtime behavior

This gives you a cleaner separation between:

- maintainability
- ship readiness
- security posture
- deployment truth

## Recommended Audit Tracks

### 1. Web Security Audit

Standard:
- `OWASP ASVS`

Focus for this repo:
- browser token handling
- CSP and static-hosting protections
- public runtime config exposure
- deep-link and route handling
- third-party script surface

Success criteria:
- no browser-stored OAuth access tokens
- no production-only secrets in client bundles
- deployment headers and runtime config are intentionally constrained

### 2. Android Security Audit

Standard:
- `OWASP MASVS`

Focus for this repo:
- manifest permissions and exported surface
- backup and local data exposure
- network transport policy
- foreground/overlay service behavior
- release signing and install/launch verification

Success criteria:
- least-privilege manifest
- release build uses production-safe backup and network posture
- release verification proves install and launch on CI

### 3. CI and Supply Chain Audit

Standard:
- `NIST SSDF`
- `SLSA-lite`

Focus for this repo:
- pinned GitHub Actions and reproducible installs
- artifact validation
- release gate truthfulness
- dependency scanning and update hygiene

Success criteria:
- CI proves the same thing the README and workflow claims
- release artifacts are test-validated
- noisy warnings do not hide real failures

### 4. Product Truth Audit

This is repo-specific, but it matters here more than usual.

Focus:
- README claims vs actual deploy behavior
- PWA/offline claims vs real implementation
- smoke tests vs real user-critical flows
- Pages URL and base-path correctness

Success criteria:
- docs describe what actually ships
- deploy success means live site success, not just local build success

## Practical Scoring Model

Use four scores instead of one blended number:

- `Code Health /100`
- `Release Readiness /10`
- `Web Security /10`
- `Mobile Security /10`

Current suggested baseline:

- Code Health: `78/100`
- Release Readiness: `7.0/10`
- Web Security: `7.5/10`
- Mobile Security: `5.8/10`

Reason the mobile score is lowest:
- Android CI is improving, but release proof is still the least stable part of the delivery path.

## Next Audit Order

1. Finish the Android `MASVS` pass and turn findings into fixes.
2. Run an `ASVS`-style web pass focused on remaining browser/runtime config edges.
3. Run a `SSDF/SLSA-lite` CI review and tighten any weak release assumptions.
4. Refresh the repo health score after the security and release fixes land.

## Expected Outputs

Each audit pass should produce:

- a short executive summary
- prioritized findings with file references
- a fix order
- a rerun/verification checklist

That keeps the work actionable instead of becoming a static report no one uses.
