# Local security hardening

This fork is intended to be run as a local development application. The local FFmpeg/agent server has broad capabilities (file I/O, FFmpeg, Python, Remotion, AI API calls, and CreatorOS actions), so it should not be exposed to a LAN or the public Internet.

## Safe first setup

1. Generate the local API token:

   ```bash
   npm run security:init
   ```

   This creates `.hyperedit-security.json` with mode `0600`. The file is ignored by Git.

2. Create `.dev.vars` from `.dev.vars.example` only when a feature needs an API key. Keep unused keys unset.

3. Prefer the first dependency installation with lifecycle scripts disabled:

   ```bash
   npm ci --ignore-scripts
   npm audit
   ```

   Review the audit and the packages that declare install scripts before performing a normal install that enables lifecycle scripts.

4. Start the UI and FFmpeg server only after the dependency review is acceptable.

## Applied protections

- Vite binds explicitly to `127.0.0.1:5173` and accepts only local hostnames.
- The FFmpeg/agent server binds explicitly to `127.0.0.1:3333`.
- Browser origins other than the local Vite origins are rejected before routing.
- State-changing backend requests (`POST`, `PUT`, `DELETE`) require an `X-HyperEdit-Token` value generated locally. The frontend injects it automatically only when the parsed request origin exactly matches `http://127.0.0.1:3333`.
- The local token lives only in `.hyperedit-security.json`, which is ignored by Git. Vite injects it only while serving the local development app; production builds receive an empty value so the local token is not embedded in deployment artifacts.
- CreatorOS child processes receive a reduced environment rather than the complete parent `process.env`.
- The Obsidian vault mirror is no longer force-synchronized when the FFmpeg server starts; synchronization remains lazy and occurs when Obsidian data is actually queried.
- The optional Zernio MCP command is pinned to `zernio-mcp@2.1.2` and the tracked config does not contain an API-key placeholder. Supply `ZERNIO_API_KEY` through the MCP client's secret/environment configuration.
- Vite is pinned to `7.3.6`; React Router to `7.18.2`; Hono to `4.13.8`.
- All `remotion` and `@remotion/*` packages are aligned and pinned to `4.0.526`, as required by Remotion's package compatibility guidance.
- High-impact tooling versions such as `@creatoros/cli` and `@getmocha/vite-plugins` are pinned rather than floating on `latest`/caret for these entries.

## Residual trust boundaries

- Read-only media endpoints remain unauthenticated so native browser `<video>`/image loads work. They are loopback-only and browser requests from non-local origins are rejected.
- Features can intentionally send prompts, audio, video, or images to configured third-party APIs (OpenAI, Anthropic, Gemini, fal.ai, GIPHY, TypeSafe/Jev, Zernio). Do not process sensitive media until you have reviewed the feature and provider involved.
- CreatorOS can publish to real social accounts once it is configured. Treat its credentials and connected accounts as production-capable.
- FFmpeg and media parsers process untrusted media formats. Prefer test media first and keep the service loopback-only.
- Upstream changes should be reviewed before merging into this fork; do not automatically track and execute new scripts from upstream.

## Remotes

Recommended local remote layout:

```text
origin   https://github.com/MatVD/hyperedit.git
upstream https://github.com/kevinbadi/hyperedit.git
```
