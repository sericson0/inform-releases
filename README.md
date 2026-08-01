# InForm — releases

Download links and the update manifest for **InForm Motion Analysis**, a video
analysis app for dance and sports.

This repository holds no source code. It exists so the app can check for
updates and so testers have a stable place to download from.

## Install (Android)

Grab the newest `InForm-<version>-arm64.apk` from
[Releases](../../releases/latest), open it on your phone, and allow your
browser to "install unknown apps" when Android asks — that prompt is expected
for an app that is not yet on the Play Store.

Use `-arm32.apk` only if a phone refuses the arm64 build (very old devices).

## latest.json

What the app itself reads to decide whether a newer build exists. Updated by
`tool/release_android.ps1` after each release's assets are uploaded.
