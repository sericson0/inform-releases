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

Needs Android 7.0 or newer. Use `-arm32.apk` only if a phone refuses the
arm64 build (very old devices).

## Updating

The version is at the foot of the app's opening screen. When a newer build
exists that same line turns into an Update button, which opens the download
here. Install it straight over the top — nothing is lost.

Please quote that version in any bug report; it is the first thing worth
knowing.

## Please don't uninstall

Everything you film, save and annotate lives inside the app, and Android
deletes all of it when an app is uninstalled — projects, recordings and the
video library alike. Updating over the top is safe. Uninstalling is not.

If a project matters, back it up first from the projects hub (⋮ → Back up),
which zips the whole thing to wherever you want to send it.

## latest.json

What the app itself reads to decide whether a newer build exists. Updated by
`tool/release_android.ps1` after each release's assets are uploaded.
