const navButtons = document.querySelectorAll(".nav-btn");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const quickActionButtons = document.querySelectorAll("[data-target-view]");
const revealItems = document.querySelectorAll(".reveal");
const projectCards = document.querySelectorAll(".project-card");
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

const validViews = new Set(["home", "about", "projects", "contact"]);

function setActiveView(viewId, pushHash = true) {
  if (!validViews.has(viewId)) {
    return;
  }

  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewId);
  });

  viewPanels.forEach((panel) => {
    const isActive = panel.dataset.viewPanel === viewId;
    panel.classList.toggle("is-active", isActive);
  });

  if (pushHash) {
    history.replaceState(null, "", `#${viewId}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getInitialView() {
  const hashView = window.location.hash.replace("#", "");
  return validViews.has(hashView) ? hashView : "home";
}

function setRevealOrder() {
  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-order", String(index % 6));
  });
}

function setupProjectCardGlow() {
  projectCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.view);
  });
});

quickActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.targetView);
  });
});

window.addEventListener("hashchange", () => {
  setActiveView(getInitialView(), false);
});

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "Thanks! Your message is ready to send.";
    contactForm.reset();
  });
}

setRevealOrder();
setupProjectCardGlow();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  revealItems.forEach((item) => {
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });
}

setActiveView(getInitialView(), false);
