# Security Policy

## Supported versions

Security fixes are released for the maintained `@stackline/vue-google-maps`
version lines documented in the README. Use the latest patch release available
for the Vue line used by your application.

Vue 2 is end of life upstream. Its compatibility line remains available, but
has no compatible framework fix for `GHSA-5j4c-8p2g-v4jx`. The repository's
selective audit gate accepts only that low-severity, unfixed finding and rejects
all other documentation-app vulnerabilities.

## Reporting a vulnerability

Report suspected vulnerabilities privately through
[GitHub Security Advisories](https://github.com/alexandroit/vue-google-maps/security/advisories/new).
Do not publish exploit details in a GitHub issue.

Include the affected version, Vue and Node.js versions, a minimal synthetic
reproduction, realistic impact, and any known mitigation. Remove credentials,
personal data, and proprietary application code.

We aim to acknowledge reports within three business days, provide an initial
assessment within seven business days, and send an update at least every
fourteen days while confirmed remediation is active. Coordinated disclosure is
preferred.
