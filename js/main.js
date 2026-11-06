/* ============================================================
   RISTORANTE IL LOGGIATO — il sito come un film · interazioni
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("header");
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  var toTop = document.getElementById("toTop");
  var mobBar = document.querySelector(".mob-bar");

  document.body.classList.add("is-loaded");
  if (prefersReduced) document.body.classList.remove("preload");

  /* ---------- Scroll: header, progress, rail, top, mob-bar ---------- */
  var progress = document.getElementById("progress");
  var railFill = document.getElementById("railFill");
  var heroBg = document.getElementById("heroBg");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (y / max) * 100 : 0;

    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > 700);
    mobBar.classList.toggle("is-visible", y > 560);
    progress.style.width = pct + "%";
    if (railFill) railFill.style.height = pct + "%";
    if (heroBg && y < window.innerHeight * 1.2) {
      heroBg.style.transform = "translateY(" + y * 0.18 + "px)";
    }
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScroll();
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Cursore personalizzato ---------- */
  var cursor = document.getElementById("cursor");
  if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReduced) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!cursor.style.visibility) cursor.style.opacity = "1";
    });
    (function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.left = cx + "px";
      cursor.style.top = cy + "px";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("a, button, .film__item, input, textarea, summary, [role='button']");
      cursor.classList.toggle("is-hover", !!t);
    });
    document.addEventListener("mouseleave", function () {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", function () {
      cursor.style.opacity = "1";
    });
  } else if (cursor) {
    cursor.style.display = "none";
  }

  /* ---------- Menu mobile ---------- */
  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Apri il menu");
    document.body.classList.remove("nav-lock");
  }

  navToggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    document.body.classList.toggle("nav-lock", open);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeNav();
      closeLightbox();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Wipe immagine storia (clip-path) */
  var wipe = document.querySelector(".storia__wipe");
  if (wipe && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          wipe.classList.add("is-visible");
          io.unobserve(wipe);
        }
      });
    }, { threshold: 0.25 }).observe(wipe);
  }

  /* ---------- Carta (accordion gigante) ---------- */
  var carteItems = document.querySelectorAll(".carte__item");
  carteItems.forEach(function (item) {
    var head = item.querySelector(".carte__head");
    head.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      carteItems.forEach(function (i) {
        i.classList.remove("is-open");
        i.querySelector(".carte__head").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
        item.querySelectorAll(".reveal").forEach(function (el) {
          el.classList.add("is-visible");
        });
      }
    });
  });

  /* ---------- Esploratore vini (tab) ---------- */
  var wineTabs = Array.prototype.slice.call(document.querySelectorAll(".wine-tab"));
  function selectWineTab(tab, noFocus) {
    wineTabs.forEach(function (t) {
      var active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", active ? "true" : "false");
      t.setAttribute("tabindex", active ? "0" : "-1");
      var group = document.getElementById(t.getAttribute("aria-controls"));
      if (group) {
        if (active) {
          group.hidden = false;
          group.classList.remove("wine-group--in");
          void group.offsetWidth;
          group.classList.add("wine-group--in");
        } else {
          group.hidden = true;
        }
      }
    });
    if (!noFocus) tab.focus();
  }
  wineTabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      selectWineTab(tab);
    });
    tab.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        selectWineTab(wineTabs[(i + 1) % wineTabs.length]);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        selectWineTab(wineTabs[(i - 1 + wineTabs.length) % wineTabs.length]);
      } else if (e.key === "Home") {
        e.preventDefault();
  if (wineTabs.length) selectWineTab(wineTabs[0]);
      } else if (e.key === "End") {
        e.preventDefault();
        selectWineTab(wineTabs[wineTabs.length - 1]);
      }
    });
  });
  if (wineTabs.length) selectWineTab(wineTabs[0], true);

  /* ---------- Galleria: pellicola + lightbox ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".film__item img"));
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var current = 0;

  function showImage(i) {
    current = (i + galleryItems.length) % galleryItems.length;
    var img = galleryItems[current];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    var cap = img.parentElement.querySelector("figcaption");
    lightboxCaption.textContent = (cap ? cap.textContent : "").trim() || img.alt || "";
  }

  function openLightbox(i) {
    showImage(i);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox__close").focus();
  }

  function closeLightbox() {
    if (!lightbox.hidden) {
      lightbox.hidden = true;
      document.body.style.overflow = "";
    }
  }

  galleryItems.forEach(function (img, i) {
    var fig = img.parentElement;
    fig.addEventListener("click", function () { openLightbox(i); });
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(i); }
    });
  });

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", function () { showImage(current - 1); });
  document.getElementById("lightboxNext").addEventListener("click", function () { showImage(current + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  var touchX = null;
  lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showImage(current + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* ---------- Slider recensioni ---------- */
  var track = document.getElementById("sliderTrack");
  var slides = Array.prototype.slice.call(track.children);
  var dotsWrap = document.getElementById("sliderDots");
  var prevBtn = document.getElementById("sliderPrev");
  var nextBtn = document.getElementById("sliderNext");
  var slideIndex = 0;
  var timer;

  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", "Vai alla recensione " + (i + 1));
    dot.addEventListener("click", function () { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function goTo(i) {
    slideIndex = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + slideIndex * 100 + "%)";
    dots.forEach(function (d, k) { d.classList.toggle("is-active", k === slideIndex); });
  }

  prevBtn.addEventListener("click", function () { goTo(slideIndex - 1); restart(); });
  nextBtn.addEventListener("click", function () { goTo(slideIndex + 1); restart(); });

  function restart() {
    clearInterval(timer);
    if (!prefersReduced) timer = setInterval(function () { goTo(slideIndex + 1); }, 6000);
  }
  restart();

  /* ---------- Form contatti ---------- */
  var form = document.getElementById("contactForm");
  var feedback = document.getElementById("formFeedback");

  function markInvalid(field, bad) {
    field.classList.toggle("is-invalid", bad);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = document.getElementById("fNome");
    var email = document.getElementById("fEmail");
    var msg = document.getElementById("fMessaggio");
    var ok = true;

    [nome, email, msg].forEach(function (f) { markInvalid(f, false); });

    if (!nome.value.trim()) { markInvalid(nome, true); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { markInvalid(email, true); ok = false; }
    if (msg.value.trim().length < 10) { markInvalid(msg, true); ok = false; }

    if (!ok) {
      feedback.textContent = "Per favore compila correttamente i campi obbligatori (Nome, Email, Messaggio).";
      feedback.className = "form-feedback is-err";
      return;
    }

    feedback.textContent = "Grazie! La vostra richiesta è stata registrata. Per una conferma immediata chiamate il +39 0783 666666.";
    feedback.className = "form-feedback is-ok";
    form.reset();
  });

  ["input", "blur"].forEach(function (evt) {
    form.addEventListener(evt, function (e) {
      if (e.target.matches("input, textarea")) markInvalid(e.target, false);
    }, true);
  });

  /* ---------- Back to top ---------- */
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---------- Anno footer ---------- */
  document.getElementById("anno").textContent = new Date().getFullYear();

  onScroll();
})();
