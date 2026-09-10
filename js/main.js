"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const product = window.FLEXTECH_PRODUCT;
  if (!product || !Array.isArray(product.sizes)) return;

  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const text = (selector, value, root = document) => {
    all(selector, root).forEach((element) => { element.textContent = value; });
  };
  const track = (name, parameters) => {
    if (typeof window.fbq === "function") window.fbq("track", name, parameters);
  };

  track("ViewContent", { content_name: product.name });

  let selectedSize = null;
  const sizeOptions = document.querySelector("[data-size-options]");
  const checkoutLinks = all("[data-checkout]");
  const selectionErrors = all("[data-selection-error]");

  const selectSize = (size) => {
    selectedSize = size;
    text("[data-selected-size]", `Tamanho ${size.id} selecionado · ${size.range}`);
    selectionErrors.forEach((error) => { error.textContent = ""; error.hidden = true; });
    checkoutLinks.forEach((link) => {
      link.href = size.checkout;
      link.dataset.size = size.id;
      link.removeAttribute("aria-disabled");
      link.textContent = `Continuar com tamanho ${size.id}`;
    });
  };

  if (sizeOptions) {
    const fragment = document.createDocumentFragment();
    product.sizes.forEach((size) => {
      const label = document.createElement("label");
      label.className = "size-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "flextech-size";
      input.id = `size-${size.id.toLowerCase()}`;
      input.value = size.id;
      const sizeDescription = sizeOptions.getAttribute("aria-describedby");
      if (sizeDescription) input.setAttribute("aria-describedby", sizeDescription);
      input.addEventListener("change", () => { if (input.checked) selectSize(size); });
      const copy = document.createElement("span");
      copy.className = "size-option__copy";
      const name = document.createElement("strong");
      name.textContent = size.id;
      const range = document.createElement("small");
      range.textContent = size.range;
      copy.append(name, range);
      label.append(input, copy);
      fragment.append(label);
    });
    sizeOptions.replaceChildren(fragment);
  }

  all("[data-size-guide]").forEach((guide) => {
    const fragment = document.createDocumentFragment();
    product.sizes.forEach((size) => {
      const row = document.createElement("tr");
      const sizeCell = document.createElement("th");
      sizeCell.scope = "row";
      sizeCell.textContent = size.id;
      const rangeCell = document.createElement("td");
      rangeCell.textContent = size.range;
      row.append(sizeCell, rangeCell);
      fragment.append(row);
    });
    guide.replaceChildren(fragment);
  });
  text("[data-size-faq]", `${product.sizes.map((size) => `${size.id}: ${size.range}`).join("; ")}. ${product.sizingWarning}`);
  text("[data-sizing-warning]", product.sizingWarning);
  text("[data-selected-size]", "Selecione um tamanho para continuar.");
  text("[data-sticky-label]", "Escolher meu tamanho");

  // A deliberate selection is required on each visit: never infer or preselect a size.
  checkoutLinks.forEach((link) => {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("role", "link");
    link.setAttribute("tabindex", "0");
    const checkout = (event) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      if (!selectedSize) {
        event.preventDefault();
        selectionErrors.forEach((error) => {
          error.hidden = false;
          error.textContent = "Escolha um tamanho antes de continuar.";
        });
        sizeOptions?.querySelector("input")?.focus();
        return;
      }
      // Only an actual outbound checkout activation counts. Internal CTAs do not.
      track("InitiateCheckout", {
        content_name: product.name,
        content_category: "Joelheira",
        content_ids: [selectedSize.id]
      });
    };
    link.addEventListener("click", checkout);
    link.addEventListener("auxclick", checkout);
    link.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !selectedSize) checkout(event);
    });
  });

  // History navigation can restore native radio state after DOMContentLoaded.
  // Reconcile that existing choice after pageshow; do not infer or persist a size.
  const reconcileRestoredSize = () => {
    const checked = sizeOptions?.querySelector("input[name='flextech-size']:checked");
    const restored = product.sizes.find((size) => size.id === checked?.value);
    if (restored) selectSize(restored);
  };
  const requestSelectionReconcile = () => {
    window.requestAnimationFrame(reconcileRestoredSize);
  };
  window.addEventListener("pageshow", requestSelectionReconcile);
  requestSelectionReconcile();

  const sticky = document.querySelector("[data-sticky]");
  const heroCta = document.querySelector("[data-hero-cta]");
  const purchase = document.querySelector("#comprar");
  const competingCtas = [...checkoutLinks, ...all("[data-final-cta]")];
  if (sticky && heroCta && purchase) {
    const media = window.matchMedia("(max-width: 767px)");
    let requested = false;
    const visible = (element) => {
      const box = element.getBoundingClientRect();
      return box.bottom > 0 && box.top < window.innerHeight && box.width > 0 && box.height > 0;
    };
    const updateSticky = () => {
      requested = false;
      const heroHasPassed = heroCta.getBoundingClientRect().bottom <= 0;
      sticky.hidden = !media.matches || !heroHasPassed || visible(purchase) ||
        competingCtas.some(visible) || Boolean(document.querySelector("dialog[open]"));
    };
    const requestUpdate = () => {
      if (requested) return;
      requested = true;
      window.requestAnimationFrame(updateSticky);
    };
    updateSticky();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pageshow", requestUpdate);
    document.addEventListener("toggle", requestUpdate, true);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(requestUpdate, { threshold: [0, 1] });
      [heroCta, purchase, ...competingCtas].forEach((element) => observer.observe(element));
    }
    all("[data-sticky-link]").forEach((link) => { link.href = "#comprar"; });
  }

  const video = document.querySelector("#product-video");
  const play = document.querySelector("#video-play");
  const videoStatus = document.querySelector("[data-video-status]");
  const videoFallback = document.querySelector("[data-video-fallback]");
  if (video && play) {
    let sourceLoaded = false;
    let starting = false;
    let playAttempt = 0;
    let loadingNotice;
    const status = (message) => {
      if (!videoStatus) return;
      videoStatus.textContent = message;
      videoStatus.hidden = !message;
    };
    const showFailure = () => {
      if (!sourceLoaded) return;
      window.clearTimeout(loadingNotice);
      starting = false;
      play.disabled = false;
      play.hidden = false;
      play.setAttribute("aria-label", "Tentar reproduzir a demonstração novamente");
      status("Não foi possível reproduzir aqui. Tente novamente ou abra o vídeo.");
      if (videoFallback) videoFallback.hidden = false;
    };
    play.addEventListener("click", async () => {
      if (starting) return;
      const attempt = ++playAttempt;
      starting = true;
      play.disabled = true;
      status("Carregando demonstração…");
      window.clearTimeout(loadingNotice);
      loadingNotice = window.setTimeout(() => {
        status("O vídeo está demorando a carregar. Você também pode abri-lo diretamente.");
        if (videoFallback) videoFallback.hidden = false;
      }, 12000);
      if (!sourceLoaded || video.error || video.networkState === video.NETWORK_NO_SOURCE) {
        if (video.dataset.src) {
          video.src = video.dataset.src;
        } else {
          all("source[data-src]", video).forEach((source) => {
            source.src = source.dataset.src;
          });
        }
        sourceLoaded = true;
        video.load();
      }
      video.controls = true;
      video.tabIndex = 0;
      video.removeAttribute("aria-hidden");
      try {
        await video.play();
      } catch (_) {
        if (attempt === playAttempt) showFailure();
      }
    });
    video.addEventListener("playing", () => {
      window.clearTimeout(loadingNotice);
      starting = false;
      play.disabled = false;
      if (document.activeElement === play) video.focus();
      play.hidden = true;
      status("");
      if (videoFallback) videoFallback.hidden = true;
    });
    video.addEventListener("error", showFailure);
    all("source", video).forEach((source) => source.addEventListener("error", showFailure));
    // Once started, native controls remain available for pause, replay and scrubbing.
    // The poster, explicit play button and fallback never depend on autoplay.
  }

  const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
  const localAsset = (value, extensions) => {
    if (!nonempty(value)) return null;
    try {
      const url = new URL(value, document.baseURI);
      const path = decodeURIComponent(url.pathname);
      const base = new URL("assets/", document.baseURI);
      if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) ||
        url.username || url.password || url.search || url.hash || !extensions.test(path)) return null;
      return url.href;
    } catch (_) { return null; }
  };
  const contexts = { fit: "Ajuste", use: "Uso", delivery: "Entrega" };
  const ids = new Set();
  const proof = (Array.isArray(window.FLEXTECH_PROOF) ? window.FLEXTECH_PROOF : []).filter((item) => {
    if (!item || !nonempty(item.id) || ids.has(item.id) ||
      item.approved !== true || item.published !== true ||
      !["review", "creator"].includes(item.type) || !Object.hasOwn(contexts, item.context) ||
      ![item.author, item.text, item.sourceRef, item.permissionReference].every(nonempty) ||
      (item.type === "creator" && !nonempty(item.disclosure))) return false;
    ids.add(item.id);
    return true;
  });
  const template = document.querySelector("#review-template");
  if (template) {
    all("[data-proof-slot]").forEach((slot) => {
      const items = proof.filter((item) => item.context === slot.dataset.proofSlot);
      const grid = slot.querySelector("[data-proof-cards]");
      if (!items.length || !grid) return;
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        const card = template.content.cloneNode(true);
        text("[data-review-author]", item.author, card);
        text("[data-review-text]", item.text, card);
        const detail = [contexts[item.context]];
        if (product.sizes.some((size) => size.id === item.size)) detail.push(`Tamanho ${item.size}`);
        if (nonempty(item.use)) detail.push(item.use);
        if (item.type === "creator") detail.push(item.disclosure);
        text("[data-review-context]", detail.join(" · "), card);
        all("[data-review-verified]", card).forEach((badge) => {
          badge.hidden = item.type !== "review" || item.buyerVerified !== true ||
            item.orderVerified !== true || !nonempty(item.orderReference);
          if (!badge.hidden) badge.textContent = "Comprador verificado";
        });
        all("[data-review-rating]", card).forEach((rating) => {
          const valid = item.type === "review" && Number.isFinite(item.rating) && item.rating >= 1 && item.rating <= 5;
          rating.hidden = !valid;
          if (valid) rating.textContent = `${item.rating.toLocaleString("pt-BR")} de 5`;
        });
        const media = card.querySelector("[data-review-media]");
        if (media && Array.isArray(item.media)) {
          item.media.forEach((asset) => {
            if (!asset || !nonempty(asset.alt)) return;
            if (asset.type === "image") {
              const src = localAsset(asset.src, /\.(?:avif|webp|png|jpe?g)$/i);
              if (!src) return;
              const image = document.createElement("img");
              image.src = src;
              image.alt = asset.alt;
              image.loading = "lazy";
              image.decoding = "async";
              media.append(image);
            } else if (asset.type === "video") {
              const src = localAsset(asset.src, /\.(?:mp4|webm)$/i);
              const poster = localAsset(asset.poster, /\.(?:avif|webp|png|jpe?g)$/i);
              if (!src || !poster) return;
              const figure = document.createElement("figure");
              const clip = document.createElement("video");
              clip.src = src;
              clip.poster = poster;
              clip.controls = true;
              clip.playsInline = true;
              clip.preload = "none";
              clip.setAttribute("aria-label", asset.alt);
              const captions = localAsset(asset.captionsSrc, /\.vtt$/i);
              if (captions) {
                const track = document.createElement("track");
                track.kind = "captions";
                track.src = captions;
                track.srclang = "pt-BR";
                track.label = "Português";
                clip.append(track);
              }
              const caption = document.createElement("figcaption");
              caption.textContent = asset.alt;
              figure.append(clip, caption);
              media.append(figure);
            }
          });
          media.hidden = !media.childElementCount;
        }
        fragment.append(card);
      });
      grid.replaceChildren(fragment);
      slot.hidden = false;
    });
  }
  const ratedReviews = proof.filter((item) => item.type === "review" &&
    Number.isFinite(item.rating) && item.rating >= 1 && item.rating <= 5);
  const reviewCount = proof.filter((item) => item.type === "review").length;
  if (reviewCount) {
    all("[data-review-count]").forEach((count) => {
      count.textContent = `${reviewCount} ${reviewCount === 1 ? "avaliação" : "avaliações"}`;
      count.hidden = false;
    });
  }
  if (ratedReviews.length) {
    const average = ratedReviews.reduce((sum, item) => sum + item.rating, 0) / ratedReviews.length;
    all("[data-rating]").forEach((rating) => {
      rating.textContent = `${average.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} de 5 · ${ratedReviews.length} ${ratedReviews.length === 1 ? "avaliação" : "avaliações"} com nota`;
      rating.hidden = false;
    });
  }

  const localReview = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname) &&
    new URLSearchParams(window.location.search).get("review") === "1";
  all("[data-review-notes]").forEach((notes) => { notes.hidden = !localReview; });
});
