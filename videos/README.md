# Demo video assets

Put self-hosted demo clips and caption files in this folder, then add each demo
to the `demos` list near the top of `../demos.js`.

Recommended delivery format:

- MP4 using H.264 video and AAC audio for the broadest browser support.
- Optional WebM placed before the MP4 source for browsers that support it.
- 1080p or smaller, with short clips kept around 10 MB when practical.
- A 16:9 WebP poster image in `../img/`.
- English WebVTT captions (`.en.vtt`) for any spoken narration.

Keep the video controls visible. The site deliberately waits until someone
clicks a demo before downloading a video or connecting to YouTube.
