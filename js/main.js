"use strict";

document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: "Joelheira Ortopédica de Fibra de Cobre Flextech"
    });
  }

  document.querySelectorAll(".purchase-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", {
          content_name: "Joelheira Ortopédica de Fibra de Cobre Flextech",
          content_category: "Joelheira",
          content_ids: [link.dataset.size]
        });
      }
    });
  });

  const mobileCta = document.querySelector(".mobile-cta");
  const heroCta = document.querySelector(".hero-button");
  const checkoutSection = document.querySelector("#tamanhos");

  if (mobileCta && heroCta && checkoutSection) {
    let ticking = false;

    const updateMobileCta = () => {
      const heroButtonPassed = heroCta.getBoundingClientRect().bottom < 0;
      const checkoutAhead = checkoutSection.getBoundingClientRect().top > window.innerHeight * 0.45;

      mobileCta.classList.toggle("is-visible", heroButtonPassed && checkoutAhead);
      ticking = false;
    };

    const requestCtaUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateMobileCta);
        ticking = true;
      }
    };

    updateMobileCta();
    window.addEventListener("scroll", requestCtaUpdate, { passive: true });
    window.addEventListener("resize", requestCtaUpdate);
  }
});
