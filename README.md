# InForm — releases

Download links and the update manifest for **InForm Motion Analysis**, a video
analysis app for dance and sport.

**Website: [informmotion.net](https://informmotion.net)** ·
**[Get it on Google Play](https://play.google.com/store/apps/details?id=dev.sericson.inform)** ·
[Support](https://informmotion.net/support.html) ·
[Privacy](https://informmotion.net/privacy.html)

This repository holds no source code. It exists so the app can check for
updates, and so there is a stable place to download from.

## Install

Most people should install from **[Google Play](https://play.google.com/store/apps/details?id=dev.sericson.inform)** —
it updates itself and needs nothing explained.

The APKs under [Releases](../../releases/latest) are the direct-download
channel, for a phone without Play services or for testers on a build that has
not reached the store yet. Grab the newest `InForm-<version>-arm64.apk`, open it
on your phone, and allow your browser to "install unknown apps" when Android
asks — that prompt is expected for any app installed outside a store.

Needs Android 7.0 or newer. Use `-arm32.apk` only if a phone refuses the arm64
build (very old devices).

A Windows desktop build is attached to releases where one was made.

## Updating

The version is at the foot of the app's opening screen. On the direct-download
channel, when a newer build exists that same line turns into an Update button,
which opens the download here. Install it straight over the top — nothing is
lost.

Please quote that version in any bug report; it is the first thing worth
knowing.

## Please don't uninstall

Everything you film, save and annotate lives inside the app, and Android
deletes all of it when an app is uninstalled — projects, recordings and the
video library alike. Updating over the top is safe. Uninstalling is not.

If a project matters, back it up first from the projects hub (⋮ → Back up),
which zips the whole thing to wherever you want to send it.

## What is in this repo

| | |
|---|---|
| `index.html` | informmotion.net — the app's website |
| `support.html` | Support and FAQ, linked from inside the app |
| `privacy.html` | Privacy policy, linked from inside the app and from the Play listing |
| `latest.json` | What the app reads to decide whether a newer build exists. Updated by `tool/release_android.ps1` after each release's assets are uploaded. |
| `img/` | Images for the website |
| `CNAME` | Written by Settings &rarr; Pages once the custom domain is verified — do not add it by hand before DNS resolves |
