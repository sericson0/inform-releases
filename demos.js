/*
  Add video demos here. The demo section is shown only when this list
  contains at least one valid item.

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
      ]
    }
  }

  YouTube example (use the video ID, not the full URL). A Short or any other
  portrait clip takes `vertical: true`, which makes the card phone-shaped and
  gives the player a 9:16 frame; give it a portrait poster to match.
  {
    title: "Compare two attempts",
    description: "Line up two clips and play them together.",
    duration: "1:05",
    poster: "img/demo-compare.webp",
    video: { type: "youtube", id: "YOUR_VIDEO_ID", vertical: false }
  }

  A vertical demo lays its text beside the clip rather than under it, so it
  can carry an optional `details` list: a few short lines that read as
  bullets next to the video.

  Optional `preview`: a small, silent MP4 served from this site. The card
  plays it muted, on a loop, while it is scrolled into view, and shows the
  poster until it starts. Keep it short and well under a megabyte; nothing is
  downloaded until the card is on screen. Clicking the card still opens the
  full demo (and that is the only time YouTube is contacted). Visitors who
  ask for reduced motion see the poster only.
*/
const demos = [
  {
    title: "Be on the right track",
    description: "InForm lets you can track points, lines, angles, and joints.",
    details: [
      "Variable selection to track the point you want.",
      "See your technique across the full motion.",
      "Get the right measurments at the right times.",
    ],
    duration: "0:19",
    poster: "img/shot-tracking.webp",
    preview: "videos/tracking-preview.mp4",
    video: {
      type: "file",
      sources: [{ src: "videos/tracking-demo-silent.mp4", type: "video/mp4" }],
      vertical: true
    }
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
      const id = encodeURIComponent(demo.video.id);
      // YouTube loops only a playlist, so the playlist is the video itself.
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&rel=0`;
      iframe.title = demo.title;
      iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      player.append(iframe);
      return;
    }

    const video = document.createElement("video");
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
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

    player.append(video);
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canPreview = "IntersectionObserver" in window && !reducedMotion;
  const previews = [];
  let pausePreviews = () => {};

  validDemos.forEach((demo) => {
    const card = document.createElement("article");
    card.className = "demo-card";
    card.classList.toggle("vertical", demo.video.vertical === true);

    const preview = document.createElement("button");
    preview.className = "demo-preview";
    preview.type = "button";
    preview.setAttribute("aria-label", `Play demo: ${demo.title}`);

    const image = document.createElement("img");
    image.src = demo.poster;
    image.alt = "";
    image.loading = "lazy";
    preview.append(image);

    if (canPreview && typeof demo.preview === "string" && demo.preview) {
      const clip = document.createElement("video");
      clip.muted = true;
      clip.defaultMuted = true;
      clip.loop = true;
      clip.playsInline = true;
      clip.setAttribute("muted", "");
      clip.setAttribute("playsinline", "");
      clip.preload = "none";
      clip.tabIndex = -1;
      clip.setAttribute("aria-hidden", "true");
      clip.dataset.src = demo.preview;
      preview.append(clip);
      previews.push(clip);
    }

    // A centred play button over the poster; once the silent preview is
    // running it shrinks to a small pill so the clip is what you look at.
    const play = document.createElement("span");
    play.className = "demo-play";
    play.setAttribute("aria-hidden", "true");
    const playLabel = document.createElement("span");
    playLabel.className = "demo-play-label";
    playLabel.textContent = "Play video";
    play.append(playIcon(), playLabel);
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
    if (Array.isArray(demo.details) && demo.details.length) {
      const list = document.createElement("ul");
      list.className = "demo-details";
      demo.details.forEach((line) => {
        if (typeof line !== "string" || !line) return;
        const item = document.createElement("li");
        item.textContent = line;
        list.append(item);
      });
      if (list.childElementCount) copy.append(list);
    }
    card.append(preview, copy);
    grid.append(card);

    preview.addEventListener("click", () => {
      pausePreviews();
      player.replaceChildren();
      title.textContent = demo.title;
      description.textContent = demo.description;
      buildPlayer(demo);
      dialog.showModal();
    });
  });

  // Card previews run while on screen and stop as they scroll away. The
  // file is only fetched the first time a card comes into view.
  if (previews.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting && !dialog.open) {
          if (!target.src) {
            target.src = target.dataset.src;
            target.load();
          }
          target.play().then(() => target.parentElement.classList.add("playing")).catch(() => {});
        } else if (!target.paused) {
          target.pause();
        }
      });
    }, { threshold: 0.4 });
    previews.forEach((clip) => observer.observe(clip));

    dialog.addEventListener("close", () => {
      // Re-observing replays the callback with the current visibility.
      previews.forEach((clip) => { observer.unobserve(clip); observer.observe(clip); });
    });
    pausePreviews = () => previews.forEach((clip) => { if (!clip.paused) clip.pause(); });
  }

  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", () => player.replaceChildren());

  section.hidden = false;
})();

