/*
  Add video demos here. The Demos navigation item and section are shown only
  when this list contains at least one valid item.

  Self-hosted example:
  {
    title: "Find the exact frame",
    description: "Scrub precisely, step frame by frame and loop the moment.",
    duration: "0:42",
    poster: "img/demo-find-frame.webp",
    video: {
      type: "file",
      sources: [
        { src: "videos/find-frame.webm", type: "video/webm" },
        { src: "videos/find-frame.mp4", type: "video/mp4" }
      ],
      captions: "videos/find-frame.en.vtt"
    }
  }

  YouTube example (use the video ID, not the full URL). A Short or any other
  portrait clip takes `vertical: true`, which gives the player a 9:16 frame;
  its poster is still a 16:9 image, so letterbox the frame into one.
  {
    title: "Compare two attempts",
    description: "Line up two clips and play them together.",
    duration: "1:05",
    poster: "img/demo-compare.webp",
    video: { type: "youtube", id: "YOUR_VIDEO_ID", vertical: false }
  }
*/
const demos = [
  {
    title: "Track the bar path",
    description: "Tap the plate, tap Track, and InForm follows the barbell through the lift with a trail behind it.",
    duration: "0:19",
    poster: "img/demo-tracking.webp",
    video: { type: "youtube", id: "QhHHTg2qL6s", vertical: true }
  }
];

(() => {
  "use strict";

  const section = document.querySelector("#demos");
  const grid = document.querySelector("[data-demo-grid]");
  const dialog = document.querySelector("[data-demo-dialog]");
  const player = document.querySelector("[data-demo-player]");
  const title = document.querySelector("[data-demo-title]");
  const description = document.querySelector("[data-demo-description]");
  const closeButton = document.querySelector("[data-demo-close]");

  if (!section || !grid || !dialog || !player || !title || !description || !closeButton || !demos.length) return;

  const validDemos = demos.filter((demo) => {
    if (!demo || !demo.title || !demo.description || !demo.poster || !demo.video) return false;
    if (demo.video.type === "youtube") return /^[\w-]{11}$/.test(demo.video.id || "");
    return demo.video.type === "file" && Array.isArray(demo.video.sources) &&
      demo.video.sources.some((source) => source && source.src);
  });

  if (!validDemos.length) return;

  const playIcon = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 18 20");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "20");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M1 1.3v17.4c0 .5.5.8.9.6l14.4-8.7c.4-.3.4-.9 0-1.2L1.9.7C1.5.5 1 .8 1 1.3z");
    svg.append(path);
    return svg;
  };

  const buildPlayer = (demo) => {
    const vertical = demo.video.vertical === true;
    dialog.classList.toggle("vertical", vertical);
    player.classList.toggle("vertical", vertical);
    if (demo.video.type === "youtube") {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(demo.video.id)}?autoplay=1&rel=0`;
      iframe.title = demo.title;
      iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      player.append(iframe);
      return;
    }

    const video = document.createElement("video");
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.poster = demo.poster;

    demo.video.sources.forEach((item) => {
      if (!item || !item.src) return;
      const source = document.createElement("source");
      source.src = item.src;
      if (item.type) source.type = item.type;
      video.append(source);
    });

    if (demo.video.captions) {
      const track = document.createElement("track");
      track.kind = "captions";
      track.src = demo.video.captions;
      track.srclang = "en";
      track.label = "English";
      track.default = true;
      video.append(track);
    }

    player.append(video);
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  validDemos.forEach((demo) => {
    const card = document.createElement("article");
    card.className = "demo-card";

    const preview = document.createElement("button");
    preview.className = "demo-preview";
    preview.type = "button";
    preview.setAttribute("aria-label", `Play demo: ${demo.title}`);

    const image = document.createElement("img");
    image.src = demo.poster;
    image.alt = "";
    image.loading = "lazy";
    preview.append(image);

    const play = document.createElement("span");
    play.className = "demo-play";
    play.setAttribute("aria-hidden", "true");
    play.append(playIcon());
    preview.append(play);

    if (demo.duration) {
      const duration = document.createElement("span");
      duration.className = "demo-duration";
      duration.textContent = demo.duration;
      preview.append(duration);
    }

    const copy = document.createElement("div");
    copy.className = "demo-copy";
    const heading = document.createElement("h3");
    heading.textContent = demo.title;
    const summary = document.createElement("p");
    summary.textContent = demo.description;
    copy.append(heading, summary);
    card.append(preview, copy);
    grid.append(card);

    preview.addEventListener("click", () => {
      player.replaceChildren();
      title.textContent = demo.title;
      description.textContent = demo.description;
      buildPlayer(demo);
      dialog.showModal();
    });
  });

  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", () => player.replaceChildren());

  document.querySelectorAll("[data-demos-link]").forEach((link) => { link.hidden = false; });
  section.hidden = false;
})();
