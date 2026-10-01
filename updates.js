/*
  Email updates popup — the website twin of the app's "Keep up with InForm"
  dialog (Playback: lib/src/shell/email_updates_dialog.dart). Same wording,
  same three answers, same memory:

    Email me updates  → signs up, then never asks again in this browser.
    Maybe later       → (also Escape, or a tap outside) asks again in 14 days.
    No thanks         → never asks again in this browser.

  It posts to the same Cloudflare Worker the app uses, which adds the address
  to the "InForm updates" segment in Resend. No key lives here; the Worker
  holds it. The Worker only accepts `source: "inform-app"`, so that is what
  the site sends too.

  The ask appears after someone has been on the page for a little while, and
  waits if a demo video is open. A page can opt out of the automatic ask with
  <script src="updates.js" data-updates-auto="false" defer> and still offer
  the voluntary route: any element with [data-updates-open] opens the dialog.
*/
(() => {
  "use strict";

  const ENDPOINT = "https://inform-email-updates.email-updates.workers.dev/subscribe";
  const DWELL_MS = 25 * 1000;
  const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
  const CHOICE_KEY = "emailUpdates.choice";
  const SHOWN_KEY = "emailUpdates.lastShown";
  const CONTACT = "InFormMotionAnalysis@gmail.com";
  const SPORT_MAX = 100;

  const script = document.currentScript;
  const autoAsk = !script || script.dataset.updatesAuto !== "false";

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } },
    get usable() {
      try {
        localStorage.setItem("emailUpdates.test", "1");
        localStorage.removeItem("emailUpdates.test");
        return true;
      } catch (_) { return false; }
    }
  };

  const validEmail = (value) => {
    const email = value.trim();
    return email.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
  };

  /* ---------- markup ---------- */
  const dialog = document.createElement("dialog");
  dialog.className = "updates-dialog";
  dialog.setAttribute("aria-labelledby", "updates-title");
  dialog.setAttribute("aria-describedby", "updates-copy");
  dialog.innerHTML = [
    '<button class="updates-close" type="button" aria-label="Maybe later" data-updates-later>&times;</button>',
    '<svg class="updates-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
    '<form class="updates-form" novalidate data-updates-form>',
    '  <h2 id="updates-title" tabindex="-1">Keep up with InForm</h2>',
    '  <p id="updates-copy" class="updates-copy">Occasional emails about new developments.</p>',
    '  <label class="updates-label" for="updates-email">Email address</label>',
    '  <input class="updates-input" id="updates-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" spellcheck="false" autocapitalize="none" aria-describedby="updates-error" required>',
    '  <p class="updates-error" id="updates-error" role="alert" hidden></p>',
    '  <fieldset class="updates-fieldset">',
    '    <legend class="updates-label">How do you plan to use InForm?</legend>',
    '    <p class="updates-hint">Optional &middot; Select all that apply.</p>',
    '    <div class="updates-choices">',
    '      <label><input type="checkbox" name="uses" value="own_training"> My training</label>',
    '      <label><input type="checkbox" name="uses" value="coaching"> Coaching others</label>',
    '    </div>',
    '  </fieldset>',
    '  <label class="updates-label" for="updates-sport">What&rsquo;s your main sport or activity?</label>',
    '  <input class="updates-input" id="updates-sport" name="sportActivity" type="text" maxlength="' + SPORT_MAX + '" autocomplete="off" placeholder="e.g., dance, boxing, weightlifting">',
    '  <p class="updates-fine">Unsubscribe anytime. <a href="/privacy.html#email-updates">Privacy policy</a></p>',
    '  <button class="btn updates-primary" type="submit" data-updates-submit>Email me updates</button>',
    '  <button class="updates-secondary" type="button" data-updates-later>Maybe later</button>',
    '  <button class="updates-decline" type="button" data-updates-decline>No thanks &mdash; don&rsquo;t ask again</button>',
    '</form>',
    '<div class="updates-done" data-updates-done hidden>',
    '  <h2 id="updates-done-title" tabindex="-1" data-updates-done-title>You&rsquo;re on the list</h2>',
    '  <p id="updates-done-copy" class="updates-copy" data-updates-done-copy>We&rsquo;ll email you when there&rsquo;s something new to share.</p>',
    '  <button class="btn updates-primary" type="button" data-updates-close>Done</button>',
    '</div>'
  ].join("\n");

  if (typeof dialog.showModal !== "function") return;
  document.body.append(dialog);

  const form = dialog.querySelector("[data-updates-form]");
  const email = dialog.querySelector("#updates-email");
  const sport = dialog.querySelector("#updates-sport");
  const error = dialog.querySelector("#updates-error");
  const submit = dialog.querySelector("[data-updates-submit]");
  const done = dialog.querySelector("[data-updates-done]");
  const doneTitle = dialog.querySelector("[data-updates-done-title]");
  const doneCopy = dialog.querySelector("[data-updates-done-copy]");
  const formTitle = dialog.querySelector("#updates-title");
  let busy = false;

  const showError = (message) => {
    error.textContent = message;
    error.hidden = !message;
  };

  const setBusy = (value) => {
    busy = value;
    dialog.querySelectorAll("button, input").forEach((el) => { el.disabled = value; });
    submit.textContent = value ? "Please wait…" : "Email me updates";
  };

  const reset = () => {
    form.reset();
    form.hidden = false;
    done.hidden = true;
    showError("");
    email.removeAttribute("aria-invalid");
    dialog.setAttribute("aria-labelledby", "updates-title");
    dialog.setAttribute("aria-describedby", "updates-copy");
  };

  const open = () => {
    if (dialog.open) return;
    reset();
    store.set(SHOWN_KEY, String(Date.now()));
    dialog.showModal();
    formTitle.focus({ preventScroll: true });
  };

  const close = () => { if (dialog.open && !busy) dialog.close(); };

  const decline = () => {
    if (!store.set(CHOICE_KEY, "declined")) {
      showError("Could not remember your choice. Please try again.");
      return;
    }
    close();
  };

  /* ---------- signup ---------- */
  const subscribe = async (address) => {
    const uses = Array.from(form.querySelectorAll('input[name="uses"]:checked'), (el) => el.value);
    const payload = {
      email: address,
      consent: true,
      consentVersion: "inform-updates-v1",
      source: "inform-app",
      profile: { uses, sportActivity: sport.value.trim().slice(0, SPORT_MAX) }
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        redirect: "manual"
      });
    } catch (_) {
      throw new Error("Could not sign up. Check your connection and try again.");
    } finally {
      clearTimeout(timer);
    }
    if (response.status === 409) {
      throw new Error("Could not add this address. Contact " + CONTACT + " if you previously unsubscribed and want to rejoin.");
    }
    if (response.status === 429) throw new Error("Please wait a little and try again.");
    if (response.status !== 200 && response.status !== 202) throw new Error("Could not sign up. Please try again.");
    let data;
    try { data = await response.json(); } catch (_) { throw new Error("Could not confirm signup. Please try again."); }
    if (data && data.status === "subscribed") return "subscribed";
    if (data && data.status === "confirmation_required") return "confirmation_required";
    throw new Error("Could not confirm signup. Please try again.");
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    const address = email.value.trim();
    if (!validEmail(address)) {
      showError("Enter a valid email address.");
      email.setAttribute("aria-invalid", "true");
      email.focus();
      return;
    }
    showError("");
    setBusy(true);
    try {
      const result = await subscribe(address);
      store.set(CHOICE_KEY, "accepted");
      const confirm = result === "confirmation_required";
      doneTitle.textContent = confirm ? "Check your inbox" : "You’re on the list";
      doneCopy.textContent = confirm
        ? "Confirm your email address to receive InForm updates."
        : "We’ll email you when there’s something new to share.";
      setBusy(false);
      form.reset();
      form.hidden = true;
      done.hidden = false;
      dialog.setAttribute("aria-labelledby", "updates-done-title");
      dialog.setAttribute("aria-describedby", "updates-done-copy");
      doneTitle.focus({ preventScroll: true });
    } catch (err) {
      setBusy(false);
      showError(err && err.message ? err.message : "Could not finish signup. Please try again.");
    }
  });

  email.addEventListener("input", () => {
    showError("");
    email.removeAttribute("aria-invalid");
  });

  dialog.querySelectorAll("[data-updates-later], [data-updates-close]").forEach((el) => el.addEventListener("click", close));
  dialog.querySelector("[data-updates-decline]").addEventListener("click", decline);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener("cancel", (event) => { if (busy) event.preventDefault(); });

  document.querySelectorAll("[data-updates-open]").forEach((el) => {
    el.addEventListener("click", (event) => { event.preventDefault(); open(); });
  });

  /* ---------- the automatic ask ---------- */
  if (!autoAsk || !store.usable) return;
  if (store.get(CHOICE_KEY)) return;
  const last = Number(store.get(SHOWN_KEY));
  if (last && (last > Date.now() || Date.now() - last < COOLDOWN_MS)) return;

  const tryAsk = () => {
    if (store.get(CHOICE_KEY) || dialog.open) return;
    if (document.visibilityState !== "visible") {
      document.addEventListener("visibilitychange", tryAsk, { once: true });
      return;
    }
    // Never on top of a demo video or another dialog.
    if (document.querySelector("dialog[open]")) { setTimeout(tryAsk, 5000); return; }
    open();
  };
  setTimeout(tryAsk, DWELL_MS);
})();
