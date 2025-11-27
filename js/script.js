/* ==============================
   UTIL: Scroll to top
   ============================== */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==============================
   THEME (persist + auto)
   ============================== */
const THEME_KEY = "safi-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark" || theme === "light") {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }

  const label = document.querySelector(".theme-toggle span");
  if (label) label.textContent = (root.getAttribute("data-theme") === "dark") ? "Night" : "Day";
}

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return systemPrefersDark() ? "dark" : "light";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || getInitialTheme();
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function createThemeButton() {
  const btn = document.createElement("button");
  btn.className = "theme-toggle";
  btn.type = "button";
  btn.innerHTML = `<div class="dot" aria-hidden="true"></div><span>Day</span>`;
  return btn;
}

function placeThemeButton() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  const links = nav.querySelector(".nav-links");
  const burger = nav.querySelector(".menu-toggle");
  if (!links || !burger) return;

  let btn = nav.querySelector(".theme-toggle");
  if (!btn) btn = nav.appendChild(createThemeButton());

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // Place just before the hamburger
    if (btn.nextElementSibling !== burger) burger.insertAdjacentElement("beforebegin", btn);
  } else {
    // Place right after the links
    if (links.nextElementSibling !== btn) links.insertAdjacentElement("afterend", btn);
  }
}

/* ==============================
   MENU: Delegated handlers (robust to DOM moves)
   ============================== */
function initMenuHandlers() {
  const nav = document.querySelector("nav");
  const menu = nav?.querySelector(".nav-links");
  const burger = nav?.querySelector(".menu-toggle");
  if (!nav || !menu || !burger) return;

  // 1) Event delegation: any click on .menu-toggle toggles menu
  nav.addEventListener("click", (e) => {
    const onBurger = e.target.closest(".menu-toggle");
    const onTheme  = e.target.closest(".theme-toggle");

    if (onBurger) {
      e.stopPropagation();
      menu.classList.toggle("active");
      return;
    }

    if (onTheme) {
      e.stopPropagation();
      toggleTheme();
      return;
    }
  });

  // 2) Close menu when any nav link is clicked
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => menu.classList.remove("active"));
  });

  // 3) Click-outside to close
  document.addEventListener("click", (e) => {
    const onMenu   = menu.contains(e.target);
    const onBurger = burger.contains(e.target);
    const onTheme  = !!document.querySelector(".theme-toggle") && document.querySelector(".theme-toggle").contains(e.target);

    if (menu.classList.contains("active") && !onMenu && !onBurger && !onTheme) {
      menu.classList.remove("active");
    }
  });
}

/* ==============================
   INIT
   ============================== */
document.addEventListener("DOMContentLoaded", () => {
  // Theme
  applyTheme(getInitialTheme());

  // Place theme toggle and re-place on resize
  placeThemeButton();
  window.addEventListener("resize", placeThemeButton);

  // Follow system only if user hasn't chosen
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", (e) => {
    const saved = localStorage.getItem(THEME_KEY);
    if (!saved) applyTheme(e.matches ? "dark" : "light");
  });

  // Menu handlers (delegated)
  initMenuHandlers();
});
