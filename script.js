const dot = document.querySelector(".cursor-dot");
const ring = document.querySelector(".cursor-ring");
const copyButtons = document.querySelectorAll("[data-copy] button");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const galleryTrack = document.querySelector(".gallery-track");
const galleryNavButtons = document.querySelectorAll(".gallery-nav");
const polaroids = document.querySelectorAll(".polaroid");
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector("figcaption");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxNav = lightbox?.querySelectorAll(".lightbox-nav button");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;
let activePolaroidIndex = 0;

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  if (dot) {
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }

  if (Math.random() > 0.75) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${mouseX + (Math.random() * 14 - 7)}px`;
    sparkle.style.top = `${mouseY + (Math.random() * 14 - 7)}px`;
    document.body.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 600);
  }
});

function animateCursor() {
  if (ring) {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll("a, button").forEach((item) => {
  item.addEventListener("mouseenter", () => ring?.classList.add("is-hovering"));
  item.addEventListener("mouseleave", () => ring?.classList.remove("is-hovering"));
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.closest("[data-copy]").dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = "Copied!";
    } catch {
      button.textContent = "Failed";
    }
    window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1400);
  });
});

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

function scrollGallery(direction) {
  if (!galleryTrack) return;
  const card = galleryTrack.querySelector(".polaroid");
  const scrollAmount = card ? card.offsetWidth + 28 : 300;
  galleryTrack.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
}

galleryNavButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    scrollGallery(btn.dataset.dir === "next" ? 1 : -1);
  });
});

function openLightbox(index) {
  if (!lightbox || !lightboxImg || !polaroids.length) return;
  activePolaroidIndex = index;
  const polaroid = polaroids[index];
  const img = polaroid.querySelector("img");
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = polaroid.dataset.caption || img.alt;
  lightbox.showModal();
}

function navigateLightbox(direction) {
  const total = polaroids.length;
  activePolaroidIndex = (activePolaroidIndex + direction + total) % total;
  openLightbox(activePolaroidIndex);
}

polaroids.forEach((polaroid, index) => {
  polaroid.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", () => lightbox.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightboxNav?.forEach((btn) => {
  btn.addEventListener("click", () => {
    navigateLightbox(btn.dataset.dir === "next" ? 1 : -1);
  });
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.open) return;
  if (event.key === "Escape") lightbox.close();
  if (event.key === "ArrowLeft") navigateLightbox(-1);
  if (event.key === "ArrowRight") navigateLightbox(1);
});

document.querySelectorAll("img").forEach((image, index) => {
  image.addEventListener("error", () => {
    image.removeAttribute("src");
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", image.alt);
    image.style.opacity = "0";
    const parent = image.parentElement;
    if (parent && !parent.querySelector(".fallback-label")) {
      const label = document.createElement("span");
      label.className = "fallback-label";
      label.textContent = index < 3 ? "Add photo" : "$ALYCIACOW";
      Object.assign(label.style, {
        position: "absolute",
        inset: "0",
        display: "grid",
        placeItems: "center",
        color: "#3a7a30",
        fontWeight: "900",
        fontSize: "clamp(1.2rem, 4vw, 2.4rem)",
        fontFamily: "Bangers, cursive",
      });
      parent.style.position = "relative";
      parent.appendChild(label);
    }
  });
});
