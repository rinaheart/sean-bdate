import { toCanvas } from "html-to-image";
import defaultAvatar from "../assets/avatar-default.webp";
import defaultHero from "../assets/sean-hero.webp";
import eyePanelOn from "../assets/eye-panel.webp";
import eyePanelOff from "../assets/eye-panel-black.webp";

(() => {
  "use strict";

  const CARD_W = 1080;
  const CARD_H = 1620;
  const STORAGE_KEY = "sean-invite:v2";
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_IMAGE_PX = 1200;
  const NAME_MAX = 28;
  const DEFAULT_NAME = "GUY";
  const NAME_FONT = { max: 92, min: 26 };

  const DEFAULT_STATE = {
    avatar: null,
    vipText: "VIP GUEST",
    heyText: "HEY",
    name: DEFAULT_NAME,
    ego: true,
    egoLabel: "EGOIST:",
    egoOnText: "ON",
    egoOffText: "OFF",
    eyeImg: null,
    heroImg: null,
    titleLead: "You're invited to",
    titleName: "Sean's",
    titleAgeNum: "12",
    titleAgeSup: "TH",
    titleEvent: "Birthday!",
    sfxVisible: true,
    infoDate: "NOV 11, 2026",
    infoTime: "01:00 PM",
    infoPhone: "(123) 456 7ABC",
    infoLocation: "CENTRAL PARK (NY)",
    folioLeft: "CH.12 — BIRTHDAY ARC",
    folioRight: "BLUE LOCK · EDITION",
  };

  const $ = (id) => document.getElementById(id);
  const el = {
    card: $("card"),
    avatarBtn: $("avatarBtn"),
    avatarImg: $("avatarImg"),
    avatarInput: $("avatarInput"),
    eyeInput: $("eyeInput"),
    heroInput: $("heroInput"),
    vipCaption: $("vipCaption"),
    heyText: $("heyText"),
    nameBtn: $("nameBtn"),
    nameText: $("nameText"),
    nameInput: $("nameInput"),
    bubble: document.querySelector(".bubble"),
    panelBubble: document.querySelector(".panel--bubble"),
    eyeBtn: $("eyeBtn"),
    eyeImg: $("eyeImg"),
    eyePanel: document.querySelector(".panel--eye"),
    egoLabel: $("egoLabel"),
    egoVal: $("egoVal"),
    eyeHintText: $("eyeHintText"),
    heroImg: $("heroImg"),
    sfxRumble: $("sfxRumble"),
    sfxImpact: $("sfxImpact"),
    titleBlock: $("titleBlock"),
    titleLead: $("titleLead"),
    titleName: $("titleName"),
    titleAgeNum: $("titleAgeNum"),
    titleAgeSup: $("titleAgeSup"),
    titleEvent: $("titleEvent"),
    infoDateText: $("infoDateText"),
    infoTimeText: $("infoTimeText"),
    infoPhoneLink: $("infoPhoneLink"),
    infoPhoneText: $("infoPhoneText"),
    infoLocationLink: $("infoLocationLink"),
    infoLocationText: $("infoLocationText"),
    folioLeft: $("folioLeft"),
    folioRight: $("folioRight"),
    customizeBtn: $("customizeBtn"),
    downloadBtn: $("downloadBtn"),
    clearNameBtn: $("clearNameBtn"),
    resetBtn: $("resetBtn"),
    controls: document.querySelector(".controls"),
    toast: $("toast"),
    mainLines: $("mainLines"),
    bubbleLines: $("bubbleLines"),
    modal: $("previewModal"),
    modalBackdrop: $("modalBackdrop"),
    modalCloseBtn: $("modalCloseBtn"),
    modalDoneBtn: $("modalDoneBtn"),
    modalShareBtn: $("modalShareBtn"),
    modalDownloadBtn: $("modalDownloadBtn"),
    modalPreviewImg: $("modalPreviewImg"),
    customModal: $("customizeModal"),
    customBackdrop: $("customBackdrop"),
    customCloseBtn: $("customCloseBtn"),
    applyCustomizeBtn: $("applyCustomizeBtn"),
    cancelCustomizeBtn: $("cancelCustomizeBtn"),
    // Customize form inputs
    inpGuestName: $("inpGuestName"),
    inpHeyText: $("inpHeyText"),
    inpVipText: $("inpVipText"),
    pickAvatarBtn: $("pickAvatarBtn"),
    restoreAvatarBtn: $("restoreAvatarBtn"),
    toggleEgoMode: $("toggleEgoMode"),
    inpEgoLabel: $("inpEgoLabel"),
    inpEgoOnText: $("inpEgoOnText"),
    inpEgoOffText: $("inpEgoOffText"),
    pickEyeBtn: $("pickEyeBtn"),
    restoreEyeBtn: $("restoreEyeBtn"),
    inpTitleLead: $("inpTitleLead"),
    inpTitleName: $("inpTitleName"),
    inpTitleAgeNum: $("inpTitleAgeNum"),
    inpTitleAgeSup: $("inpTitleAgeSup"),
    inpTitleEvent: $("inpTitleEvent"),
    toggleSfx: $("toggleSfx"),
    pickHeroBtn: $("pickHeroBtn"),
    restoreHeroBtn: $("restoreHeroBtn"),
    inpInfoDate: $("inpInfoDate"),
    inpInfoTime: $("inpInfoTime"),
    inpInfoPhone: $("inpInfoPhone"),
    inpInfoLocation: $("inpInfoLocation"),
    inpFolioLeft: $("inpFolioLeft"),
    inpFolioRight: $("inpFolioRight"),
  };

  let state = { ...DEFAULT_STATE };
  let draftImages = { avatar: null, eyeImg: null, heroImg: null };

  /* ---------- Layout: scale fixed 1080x1620 card to viewport (Portrait & Landscape) ---------- */
  function fitCard() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isLandscape = w > h;
    const isTinyScreen = (isLandscape ? h < 260 : h < 400) || w < 280;

    let availW, availH;
    if (isLandscape) {
      const controlsW = el.controls ? el.controls.offsetWidth : 240;
      const gapAndPadW = Math.max(48, Math.round(w * 0.08));
      availW = Math.max(140, w - controlsW - gapAndPadW);
      availH = Math.max(140, h - 24);
    } else {
      const controlsH = el.controls ? el.controls.offsetHeight : 96;
      availW = Math.max(180, w - 24);
      availH = Math.max(180, h - controlsH - 32);
    }

    const byW = availW / CARD_W;
    const byH = availH / CARD_H;
    const minS = isTinyScreen ? 0.18 : 0.08;
    const s = Math.max(minS, Math.min(byW, byH, 1));
    document.documentElement.style.setProperty("--s", s.toFixed(4));
  }

  /* ---------- Manga speed lines (集中線), seeded for stable output ---------- */
  function seeded(seed) {
    return () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function drawSpeedLines(svg, { cx, cy, count, inner, color, seed, maxWidth }) {
    const rand = seeded(seed);
    const outer = 1900;
    let d = "";
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand() * 0.04;
      const r0 = inner * (0.8 + rand() * 0.6);
      const half = (0.0025 + rand() * maxWidth) / 2;
      const p = (ang, r) => `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
      d += `M${p(a, r0)}L${p(a - half, outer)}L${p(a + half, outer)}Z`;
    }
    svg.innerHTML = `<path d="${d}" fill="${color}"/>`;
  }

  /* ---------- Name & Text Sanitizers ---------- */
  function stripAccents(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  function sanitizeName(raw) {
    return stripAccents(raw || "")
      .replace(/[^A-Za-z0-9 .'-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, NAME_MAX)
      .toUpperCase();
  }

  function fitName() {
    const node = el.nameText;
    if (!state.name) return;
    const maxW = 282;
    const maxH = 195;
    const isMultiLine = node.children.length > 1;
    let low = NAME_FONT.min;
    let high = isMultiLine ? 68 : NAME_FONT.max;
    let optimal = low;

    node.style.fontSize = `${high}px`;
    if (node.scrollWidth <= maxW && node.scrollHeight <= maxH) return;

    while (low <= high) {
      const mid = (low + high) >> 1;
      node.style.fontSize = `${mid}px`;
      if (node.scrollWidth <= maxW && node.scrollHeight <= maxH) {
        optimal = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    node.style.fontSize = `${optimal}px`;
  }

  function renderName() {
    el.nameText.innerHTML = "";
    if (!state.name) {
      const blank = document.createElement("span");
      blank.className = "bubble__blank";
      blank.setAttribute("aria-hidden", "true");
      el.nameText.appendChild(blank);
      el.nameBtn.setAttribute("aria-label", "Guest name blank for handwriting. Click to edit name.");
      return;
    }
    const raw = state.name.trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    const lines = parts.length >= 2
      ? [parts[0], `${parts.slice(1).join(" ")}!`]
      : [`${raw}!`];
    for (const text of lines) {
      const span = document.createElement("span");
      span.className = "bubble__line";
      span.textContent = text;
      el.nameText.appendChild(span);
    }
    el.nameBtn.setAttribute("aria-label", `Edit guest name, currently Hey ${raw}`);
    fitName();
  }

  let justDismissedByClick = false;

  function startEditName() {
    if (justDismissedByClick || el.bubble.classList.contains("is-editing")) return;
    el.bubble.classList.add("is-editing");
    el.panelBubble?.classList.add("is-editing");
    el.nameInput.hidden = false;
    el.nameInput.value = state.name === DEFAULT_NAME ? "" : state.name;
    el.nameInput.focus();
    el.nameInput.select();
  }

  function endEditName(commit) {
    if (el.nameInput.hidden) return;
    if (commit) {
      const cleaned = sanitizeName(el.nameInput.value);
      state.name = cleaned;
      if (!cleaned) {
        showToast("Cleared name — ready for handwriting!");
      }
      renderName();
      save();
    }
    el.nameInput.hidden = true;
    el.bubble.classList.remove("is-editing");
    el.panelBubble?.classList.remove("is-editing");
    el.nameBtn.focus({ preventScroll: true });
  }

  function clearName() {
    state.name = "";
    renderName();
    save();
    showToast("Guest name cleared — ready for handwriting!");
  }

  /* ---------- Image Helpers ---------- */
  async function fileToDataUrl(file) {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_IMAGE_PX / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.9);
    } finally {
      bitmap.close?.();
    }
  }

  function setAvatar(src) {
    const targetSrc = src || defaultAvatar;
    const resolvedTarget = new URL(targetSrc, window.location.href).href;
    if (el.avatarImg.src !== resolvedTarget) {
      el.avatarImg.classList.add("is-loading");
      el.avatarImg.src = targetSrc;
    }
    if (el.avatarImg.complete && el.avatarImg.naturalWidth > 0) {
      el.avatarImg.classList.remove("is-loading");
    }
  }

  async function onAvatarPicked() {
    const file = el.avatarInput.files?.[0];
    el.avatarInput.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Please select an image file (JPG, PNG, etc.).", true);
    if (file.size > MAX_FILE_BYTES) return showToast("Image is too large. Please choose a file under 10MB.", true);
    try {
      state.avatar = await fileToDataUrl(file);
      setAvatar(state.avatar);
      save();
    } catch {
      showToast("Could not read this image. Please try a JPG or PNG.", true);
    }
  }

  /* ---------- Egoist Mode ---------- */
  function renderEgoMode() {
    const isEgo = state.ego !== false;
    if (el.eyeImg) {
      if (state.eyeImg) {
        el.eyeImg.src = state.eyeImg;
      } else {
        el.eyeImg.src = isEgo ? eyePanelOn : eyePanelOff;
      }
    }
    if (el.eyePanel) {
      el.eyePanel.classList.toggle("is-off", !isEgo);
    }
    const egoText = isEgo ? (state.egoOnText || "ON") : (state.egoOffText || "OFF");
    if (el.eyeBtn) {
      el.eyeBtn.setAttribute("aria-pressed", isEgo ? "true" : "false");
      el.eyeBtn.setAttribute("aria-label", `Toggle Egoist Mode, currently ${egoText}`);
    }
    if (el.egoLabel) {
      el.egoLabel.textContent = state.egoLabel || "EGOIST:";
    }
    if (el.egoVal) {
      el.egoVal.textContent = egoText;
      el.egoVal.className = `ego-val ${isEgo ? "ego-val--on" : "ego-val--off"}`;
    }
    if (el.eyeHintText) {
      el.eyeHintText.textContent = isEgo ? "Seal Ego" : "Awaken Ego";
    }
  }

  function toggleEgoMode() {
    state.ego = !state.ego;
    renderEgoMode();
    save();
    showToast(state.ego ? "EGOIST MODE: AWAKENED (ON)" : "EGOIST MODE: NORMAL (OFF)");
  }

  /* ---------- Render Full Card Content ---------- */
  function renderCardContent() {
    // 1. VIP & Greeting
    if (el.vipCaption) el.vipCaption.textContent = state.vipText || "VIP GUEST";
    if (el.heyText) el.heyText.textContent = state.heyText || "HEY";

    // 2. Title
    if (el.titleLead) el.titleLead.textContent = state.titleLead || "You're invited to";
    if (el.titleName) el.titleName.textContent = state.titleName || "Sean's";
    if (el.titleAgeNum) el.titleAgeNum.textContent = state.titleAgeNum || "12";
    if (el.titleAgeSup) el.titleAgeSup.textContent = state.titleAgeSup || "TH";
    if (el.titleEvent) el.titleEvent.textContent = state.titleEvent || "Birthday!";

    // 3. SFX Toggle
    const showSfx = state.sfxVisible !== false;
    if (el.sfxRumble) el.sfxRumble.classList.toggle("is-hidden", !showSfx);
    if (el.sfxImpact) el.sfxImpact.classList.toggle("is-hidden", !showSfx);

    // 4. Hero Background
    if (el.heroImg) {
      if (state.heroImg) {
        el.heroImg.src = state.heroImg;
        el.heroImg.classList.add("is-custom");
      } else {
        el.heroImg.src = defaultHero;
        el.heroImg.classList.remove("is-custom");
      }
    }

    // 5. Info Badges
    if (el.infoDateText) el.infoDateText.textContent = state.infoDate || "NOV 11, 2026";
    if (el.infoTimeText) el.infoTimeText.textContent = state.infoTime || "01:00 PM";
    if (el.infoPhoneText) el.infoPhoneText.textContent = state.infoPhone || "(123) 456 7ABC";
    if (el.infoPhoneLink) {
      const cleanPhone = (state.infoPhone || "").replace(/[^0-9+]/g, "");
      el.infoPhoneLink.href = cleanPhone ? `tel:${cleanPhone}` : "#";
      el.infoPhoneLink.setAttribute("aria-label", `Call ${state.infoPhone || ""}`);
    }
    if (el.infoLocationText) el.infoLocationText.textContent = state.infoLocation || "CENTRAL PARK (NY)";
    if (el.infoLocationLink) {
      const cleanLoc = encodeURIComponent(state.infoLocation || "Central Park NY");
      el.infoLocationLink.href = `https://maps.google.com/?q=${cleanLoc}`;
      el.infoLocationLink.setAttribute("aria-label", `Location: ${state.infoLocation || ""} on Google Maps`);
    }

    // 6. Folio
    if (el.folioLeft) el.folioLeft.textContent = state.folioLeft || "CH.12 — BIRTHDAY ARC";
    if (el.folioRight) el.folioRight.textContent = state.folioRight || "BLUE LOCK · EDITION";

    renderName();
    renderEgoMode();
    setAvatar(state.avatar);
  }

  /* ---------- Persistence ---------- */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded or private mode */
    }
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!data) return;
      state = { ...DEFAULT_STATE };
      Object.keys(DEFAULT_STATE).forEach((k) => {
        if (data[k] !== undefined && data[k] !== null) {
          state[k] = data[k];
        }
      });
      if (typeof state.name === "string") {
        state.name = state.name === "" ? "" : sanitizeName(state.name);
      }
      const VALID_IMG_PREFIX = /^data:image\/(jpeg|png|webp);base64,/i;
      if (state.avatar && !VALID_IMG_PREFIX.test(state.avatar)) state.avatar = null;
      if (state.eyeImg && !VALID_IMG_PREFIX.test(state.eyeImg)) state.eyeImg = null;
      if (state.heroImg && !VALID_IMG_PREFIX.test(state.heroImg)) state.heroImg = null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function reset() {
    state = { ...DEFAULT_STATE };
    draftImages = { avatar: null, eyeImg: null, heroImg: null };
    localStorage.removeItem(STORAGE_KEY);
    renderName();
    renderEgoMode();
    setAvatar(null);
    renderCardContent();
    showToast("Invitation reset to default.");
  }

  /* ---------- Customize Modal Logic ---------- */
  function updateCharCount(input, counterId) {
    const counter = $(counterId);
    if (!counter || !input) return;
    const max = input.getAttribute("maxlength") || "0";
    counter.textContent = `${input.value.length}/${max}`;
  }

  function wireInputCounter(input, counterId) {
    if (!input) return;
    input.addEventListener("input", () => updateCharCount(input, counterId));
  }

  function openCustomizeModal() {
    if (!el.customModal) return;
    draftImages = {
      avatar: state.avatar,
      eyeImg: state.eyeImg,
      heroImg: state.heroImg,
    };

    // Populate inputs
    if (el.inpGuestName) el.inpGuestName.value = state.name || "";
    if (el.inpHeyText) el.inpHeyText.value = state.heyText || "";
    if (el.inpVipText) el.inpVipText.value = state.vipText || "";
    if (el.toggleEgoMode) el.toggleEgoMode.checked = state.ego !== false;
    if (el.inpEgoLabel) el.inpEgoLabel.value = state.egoLabel || "";
    if (el.inpEgoOnText) el.inpEgoOnText.value = state.egoOnText || "";
    if (el.inpEgoOffText) el.inpEgoOffText.value = state.egoOffText || "";
    if (el.inpTitleLead) el.inpTitleLead.value = state.titleLead || "";
    if (el.inpTitleName) el.inpTitleName.value = state.titleName || "";
    if (el.inpTitleAgeNum) el.inpTitleAgeNum.value = state.titleAgeNum || "";
    if (el.inpTitleAgeSup) el.inpTitleAgeSup.value = state.titleAgeSup || "";
    if (el.inpTitleEvent) el.inpTitleEvent.value = state.titleEvent || "";
    if (el.toggleSfx) el.toggleSfx.checked = state.sfxVisible !== false;
    if (el.inpInfoDate) el.inpInfoDate.value = state.infoDate || "";
    if (el.inpInfoTime) el.inpInfoTime.value = state.infoTime || "";
    if (el.inpInfoPhone) el.inpInfoPhone.value = state.infoPhone || "";
    if (el.inpInfoLocation) el.inpInfoLocation.value = state.infoLocation || "";
    if (el.inpFolioLeft) el.inpFolioLeft.value = state.folioLeft || "";
    if (el.inpFolioRight) el.inpFolioRight.value = state.folioRight || "";

    // Refresh all counters
    const map = [
      [el.inpGuestName, "countName"],
      [el.inpHeyText, "countHey"],
      [el.inpVipText, "countVip"],
      [el.inpEgoLabel, "countEgoLabel"],
      [el.inpEgoOnText, "countEgoOn"],
      [el.inpEgoOffText, "countEgoOff"],
      [el.inpTitleLead, "countTitleLead"],
      [el.inpTitleName, "countTitleName"],
      [el.inpTitleAgeNum, "countTitleAgeNum"],
      [el.inpTitleAgeSup, "countTitleAgeSup"],
      [el.inpTitleEvent, "countTitleEvent"],
      [el.inpInfoDate, "countInfoDate"],
      [el.inpInfoTime, "countInfoTime"],
      [el.inpInfoPhone, "countInfoPhone"],
      [el.inpInfoLocation, "countInfoLocation"],
      [el.inpFolioLeft, "countFolioLeft"],
      [el.inpFolioRight, "countFolioRight"],
    ];
    map.forEach(([input, cid]) => updateCharCount(input, cid));

    el.customModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeCustomizeModal() {
    if (!el.customModal) return;
    el.customModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  function applyCustomize() {
    state.name = sanitizeName(el.inpGuestName?.value || "");
    state.heyText = (el.inpHeyText?.value || "").trim().toUpperCase() || "HEY";
    state.vipText = (el.inpVipText?.value || "").trim().toUpperCase() || "VIP GUEST";
    state.ego = !!el.toggleEgoMode?.checked;
    state.egoLabel = (el.inpEgoLabel?.value || "").trim().toUpperCase() || "EGOIST:";
    state.egoOnText = (el.inpEgoOnText?.value || "").trim().toUpperCase() || "ON";
    state.egoOffText = (el.inpEgoOffText?.value || "").trim().toUpperCase() || "OFF";
    state.titleLead = (el.inpTitleLead?.value || "").trim() || "You're invited to";
    state.titleName = (el.inpTitleName?.value || "").trim() || "Sean's";
    state.titleAgeNum = (el.inpTitleAgeNum?.value || "").trim() || "12";
    state.titleAgeSup = (el.inpTitleAgeSup?.value || "").trim().toUpperCase() || "TH";
    state.titleEvent = (el.inpTitleEvent?.value || "").trim() || "Birthday!";
    state.sfxVisible = !!el.toggleSfx?.checked;
    state.infoDate = (el.inpInfoDate?.value || "").trim().toUpperCase() || "NOV 11, 2026";
    state.infoTime = (el.inpInfoTime?.value || "").trim().toUpperCase() || "01:00 PM";
    state.infoPhone = (el.inpInfoPhone?.value || "").trim().toUpperCase() || "(123) 456 7ABC";
    state.infoLocation = (el.inpInfoLocation?.value || "").trim().toUpperCase() || "CENTRAL PARK (NY)";
    state.folioLeft = (el.inpFolioLeft?.value || "").trim().toUpperCase() || "CH.12 — BIRTHDAY ARC";
    state.folioRight = (el.inpFolioRight?.value || "").trim().toUpperCase() || "BLUE LOCK · EDITION";

    state.avatar = draftImages.avatar;
    state.eyeImg = draftImages.eyeImg;
    state.heroImg = draftImages.heroImg;

    renderCardContent();
    save();
    closeCustomizeModal();
    showToast("Customization applied!");
  }

  /* ---------- Export (Mobile & Desktop optimized) ---------- */
  let currentExport = { blob: null, file: null, fileName: "", url: "" };

  function openPreviewModal(blob, file, fileName) {
    if (!el.modal || !el.modalPreviewImg) return;
    if (currentExport.url) {
      URL.revokeObjectURL(currentExport.url);
    }
    const url = URL.createObjectURL(blob);
    currentExport = { blob, file, fileName, url };
    el.modalPreviewImg.src = url;

    if (el.modalShareBtn) {
      const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
      el.modalShareBtn.style.display = canShare ? "inline-flex" : "none";
    }

    el.modal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
  }

  function closePreviewModal() {
    if (!el.modal) return;
    el.modal.setAttribute("hidden", "");
    document.body.style.overflow = "";
    if (currentExport.url) {
      URL.revokeObjectURL(currentExport.url);
      currentExport.url = "";
    }
  }

  async function triggerWebShare(file) {
    if (!file || !navigator.canShare || !navigator.canShare({ files: [file] })) return false;
    try {
      await navigator.share({
        files: [file],
        title: "Sean's 12th Birthday Invitation",
        text: "You're invited to Sean's 12th Birthday!",
      });
      return true;
    } catch (err) {
      if (err.name === "AbortError") return true;
      return false;
    }
  }

  async function triggerDownload(blob, fileName) {
    if (typeof window.showSaveFilePicker === "function") {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: "PNG Image",
            accept: { "image/png": [".png"] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (err) {
        if (err.name === "AbortError") return true;
        console.warn("showSaveFilePicker error, falling back to <a> download:", err);
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(blobUrl);
    }, 1500);
    return true;
  }

  /* ---------- Image Readiness Verification ---------- */
  async function prepareCardImages() {
    const imgs = Array.from(el.card.querySelectorAll("img"));
    await Promise.all(
      imgs.map(async (img) => {
        if (!img.complete) {
          await new Promise((r) => {
            img.addEventListener("load", r, { once: true });
            img.addEventListener("error", r, { once: true });
          });
        }
        if (img.decode) {
          await img.decode().catch(() => {});
        }
      })
    );
  }

  /* ---------- Canvas Compositor ---------- */
  function drawCoverImage(ctx, img, x, y, w, h, alignY = 0.5) {
    if (!img) return;
    const nw = img.naturalWidth || img.width || w;
    const nh = img.naturalHeight || img.height || h;
    const imgRatio = nw / nh;
    const targetRatio = w / h;
    let sx = 0, sy = 0, sw = nw, sh = nh;
    if (imgRatio > targetRatio) {
      sw = nh * targetRatio;
      sx = (nw - sw) / 2;
    } else {
      sh = nw / targetRatio;
      sy = (nh - sh) * alignY;
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  const PANEL_POLYGONS = {
    avatar: [[36, 36], [360, 36], [360, 464], [36, 512]],
    eye:    [[748, 36], [1044, 36], [1044, 362], [748, 406]],
    hero:   [[36, 530], [1044, 380], [1044, 1564], [36, 1564]],
  };

  function tracePolygon(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
  }

  async function compositeCardBlob(overlayCanvas, pixelRatio) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(CARD_W * pixelRatio);
    canvas.height = Math.round(CARD_H * pixelRatio);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");

    ctx.scale(pixelRatio, pixelRatio);

    // 1. Paper background
    ctx.fillStyle = "#F7F9FF";
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    const avatarImg = el.avatarImg;
    const eyeImg = el.eyeImg;
    const heroImg = el.heroImg;

    // 2. Panel 1: Avatar
    ctx.save();
    tracePolygon(ctx, PANEL_POLYGONS.avatar);
    ctx.clip();
    ctx.fillStyle = "#0A0F2C";
    ctx.fillRect(36, 36, 324, 478);
    if (avatarImg && (avatarImg.complete || avatarImg.naturalWidth > 0)) {
      drawCoverImage(ctx, avatarImg, 36, 36, 324, 478);
    }
    ctx.restore();

    // 3. Panel 3: Eye panel
    ctx.save();
    tracePolygon(ctx, PANEL_POLYGONS.eye);
    ctx.clip();
    ctx.fillStyle = "#0A0F2C";
    ctx.fillRect(748, 36, 296, 372);
    if (eyeImg && (eyeImg.complete || eyeImg.naturalWidth > 0)) {
      drawCoverImage(ctx, eyeImg, 748, 36, 296, 372, 0.45);
    }
    ctx.restore();

    // 4. Panel 4: Sean Striker / Hero background
    ctx.save();
    tracePolygon(ctx, PANEL_POLYGONS.hero);
    ctx.clip();
    if (heroImg && (heroImg.complete || heroImg.naturalWidth > 0)) {
      if (state.heroImg) {
        drawCoverImage(ctx, heroImg, 36, 378, 1008, 1188, 0.5);
      } else {
        ctx.drawImage(heroImg, 36 - 86, 378 - 158, 1130, 1513);
      }
    }
    ctx.restore();

    // 5. Draw vector overlay (Speedlines, speech bubble, title text, SFX, badges, and svg.frames directly from DOM)
    if (overlayCanvas) {
      ctx.drawImage(overlayCanvas, 0, 0, CARD_W, CARD_H);
      overlayCanvas.width = 0;
      overlayCanvas.height = 0;
    }

    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });
  }

  async function downloadPng() {
    if (el.bubble.classList.contains("is-editing")) {
      endEditName(true);
      await new Promise((r) => setTimeout(r, 120));
    }

    const originalBtnText = el.downloadBtn.textContent;
    el.downloadBtn.disabled = true;
    el.downloadBtn.textContent = "EXPORTING…";
    document.body.classList.add("is-exporting");
    showToast("Generating high-res invitation…");

    try {
      await document.fonts.ready;
      await prepareCardImages();

      const pixelRatio = 2;

      const options = {
        width: CARD_W,
        height: CARD_H,
        pixelRatio,
        cacheBust: false,
        backgroundColor: "transparent",
        style: { transform: "none", left: "0", top: "0" },
        filter: (node) =>
          node.tagName !== "IMG" && !node.classList?.contains("no-export"),
      };

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;

      const rawName = (!state.name || state.name === DEFAULT_NAME) ? "guest" : state.name;
      const slug = stripAccents(rawName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "guest";
      const fileName = `${slug}-${dateStr}.png`;

      const overlayCanvas = await toCanvas(el.card, options);
      const blob = await compositeCardBlob(overlayCanvas, pixelRatio);
      if (!blob) throw new Error("Failed to generate image blob");

      const file = typeof File !== "undefined"
        ? new File([blob], fileName, { type: "image/png" })
        : null;

      const ua = navigator.userAgent;
      const isTouchMac = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
      const isDesktop = /Windows|Macintosh|Linux/i.test(ua) && !/Android|iPhone|iPad|iPod/i.test(ua) && !isTouchMac;

      if (isDesktop) {
        await triggerDownload(blob, fileName);
        showToast("Invitation downloaded successfully!");
      } else {
        let shared = false;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shared = await triggerWebShare(file);
          if (shared) {
            showToast("Invitation saved / shared successfully!");
          }
        }

        if (!shared) {
          await triggerDownload(blob, fileName);
          openPreviewModal(blob, file, fileName);
          showToast("Press and hold image to save to Photos.");
        }
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export failed. Please try again.", true);
    } finally {
      document.body.classList.remove("is-exporting");
      el.downloadBtn.textContent = originalBtnText;
      el.downloadBtn.disabled = false;
    }
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function showToast(msg, isError = false) {
    el.toast.textContent = msg;
    el.toast.classList.toggle("is-error", isError);
    el.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("is-visible"), 3200);
  }

  /* ---------- Wire up ---------- */
  function init() {
    drawSpeedLines(el.mainLines, { cx: 624, cy: 735, count: 150, inner: 310, color: "#DDEEFF", seed: 67, maxWidth: 0.012 });
    drawSpeedLines(el.bubbleLines, { cx: 176, cy: 196, count: 110, inner: 155, color: "#0A0F2C", seed: 12, maxWidth: 0.02 });

    const clearAvatarLoading = () => el.avatarImg.classList.remove("is-loading");
    el.avatarImg.addEventListener("load", clearAvatarLoading);
    el.avatarImg.addEventListener("error", clearAvatarLoading);

    load();
    renderCardContent();
    document.fonts.ready.then(fitName);
    prepareCardImages().catch(() => {});

    // Card interactions (preserved)
    el.avatarBtn.addEventListener("click", () => el.avatarInput.click());
    el.avatarInput.addEventListener("change", onAvatarPicked);
    el.eyeBtn?.addEventListener("click", toggleEgoMode);

    window.addEventListener(
      "pointerdown",
      (e) => {
        if (el.bubble.classList.contains("is-editing") && e.target !== el.nameInput) {
          justDismissedByClick = true;
          setTimeout(() => {
            justDismissedByClick = false;
          }, 200);
        }
      },
      true
    );

    el.nameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      startEditName();
    });
    el.panelBubble?.addEventListener("click", (e) => {
      if (!el.bubble.classList.contains("is-editing") && e.target !== el.nameInput) {
        startEditName();
      }
    });
    el.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); endEditName(true); }
      if (e.key === "Escape") { e.preventDefault(); endEditName(false); }
    });
    el.nameInput.addEventListener("blur", () => endEditName(true));

    // Controls
    el.customizeBtn?.addEventListener("click", openCustomizeModal);
    el.downloadBtn.addEventListener("click", downloadPng);
    el.clearNameBtn.addEventListener("click", clearName);
    el.resetBtn.addEventListener("click", reset);

    // Customize Modal wire up
    el.customCloseBtn?.addEventListener("click", closeCustomizeModal);
    el.cancelCustomizeBtn?.addEventListener("click", closeCustomizeModal);
    el.customBackdrop?.addEventListener("click", closeCustomizeModal);
    el.applyCustomizeBtn?.addEventListener("click", applyCustomize);

    // Modal Image picking
    el.pickAvatarBtn?.addEventListener("click", () => el.avatarInput.click());
    el.restoreAvatarBtn?.addEventListener("click", () => {
      draftImages.avatar = null;
      showToast("Avatar image restored to default");
    });

    el.pickEyeBtn?.addEventListener("click", () => el.eyeInput.click());
    el.eyeInput?.addEventListener("change", async () => {
      const file = el.eyeInput.files?.[0];
      el.eyeInput.value = "";
      if (!file) return;
      try {
        draftImages.eyeImg = await fileToDataUrl(file);
        showToast("Custom eye image selected");
      } catch {
        showToast("Could not read image file", true);
      }
    });
    el.restoreEyeBtn?.addEventListener("click", () => {
      draftImages.eyeImg = null;
      showToast("Eye panel image restored to default");
    });

    el.pickHeroBtn?.addEventListener("click", () => el.heroInput.click());
    el.heroInput?.addEventListener("change", async () => {
      const file = el.heroInput.files?.[0];
      el.heroInput.value = "";
      if (!file) return;
      try {
        draftImages.heroImg = await fileToDataUrl(file);
        showToast("Custom hero background selected");
      } catch {
        showToast("Could not read image file", true);
      }
    });
    el.restoreHeroBtn?.addEventListener("click", () => {
      draftImages.heroImg = null;
      showToast("Hero background image restored to default");
    });

    // Wire live character counters
    const counterMap = [
      [el.inpGuestName, "countName"],
      [el.inpHeyText, "countHey"],
      [el.inpVipText, "countVip"],
      [el.inpEgoLabel, "countEgoLabel"],
      [el.inpEgoOnText, "countEgoOn"],
      [el.inpEgoOffText, "countEgoOff"],
      [el.inpTitleLead, "countTitleLead"],
      [el.inpTitleName, "countTitleName"],
      [el.inpTitleAgeNum, "countTitleAgeNum"],
      [el.inpTitleAgeSup, "countTitleAgeSup"],
      [el.inpTitleEvent, "countTitleEvent"],
      [el.inpInfoDate, "countInfoDate"],
      [el.inpInfoTime, "countInfoTime"],
      [el.inpInfoPhone, "countInfoPhone"],
      [el.inpInfoLocation, "countInfoLocation"],
      [el.inpFolioLeft, "countFolioLeft"],
      [el.inpFolioRight, "countFolioRight"],
    ];
    counterMap.forEach(([input, cid]) => wireInputCounter(input, cid));

    // Preview Modal listeners
    el.modalCloseBtn?.addEventListener("click", closePreviewModal);
    el.modalDoneBtn?.addEventListener("click", closePreviewModal);
    el.modalBackdrop?.addEventListener("click", closePreviewModal);
    el.modalDownloadBtn?.addEventListener("click", () => {
      if (currentExport.blob && currentExport.fileName) {
        triggerDownload(currentExport.blob, currentExport.fileName);
        showToast("Download started!");
      }
    });
    el.modalShareBtn?.addEventListener("click", async () => {
      if (currentExport.file) {
        const ok = await triggerWebShare(currentExport.file);
        if (ok) showToast("Saved / Shared successfully!");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (el.customModal && !el.customModal.hasAttribute("hidden")) {
          closeCustomizeModal();
        } else if (el.modal && !el.modal.hasAttribute("hidden")) {
          closePreviewModal();
        }
      }
    });

    fitCard();
    window.addEventListener("resize", fitCard);
  }

  init();
})();
