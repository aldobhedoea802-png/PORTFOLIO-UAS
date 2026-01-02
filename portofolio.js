/* ===============================
   TYPING EFFECT
================================ */
const texts = ["Information System", "Web Developer", "Creative Designer"];
let textIndex = 0, charIndex = 0, isDeleting = false;
const textEl = document.getElementById("text");

function typing() {
  const current = texts[textIndex];
  textEl.textContent = current.substring(0, charIndex);

  if (!isDeleting) {
    charIndex++;
    if (charIndex > current.length) {
      isDeleting = true;
      return setTimeout(typing, 1200);
    }
  } else {
    charIndex--;
    if (charIndex < 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
    }
  }
  setTimeout(typing, isDeleting ? 60 : 100);
}
typing();


/* ===============================
   COMMENT SYSTEM
================================ */
const sendBtn = document.getElementById("sendComment");
const nameInput = document.getElementById("commentName");
const messageInput = document.getElementById("commentMessage");
const avatarInput = document.getElementById("commentAvatar");
const commentList = document.getElementById("commentList");
const commentCount = document.getElementById("commentCount");

let comments = JSON.parse(localStorage.getItem("comments")) || [
  { name: "Brian", text: "jiwa anak muda yang berbakat.", time: Date.now(), likes: 0, replies: [] },
  { name: "Dorayaki", text: "Keren dan inspiratif 🔥", time: Date.now(), likes: 0, replies: [] }
];

const timeAgo = time => {
  const d = Math.floor((Date.now() - time) / 1000);
  if (d < 60) return "baru saja";
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  return `${Math.floor(d / 86400)} hari lalu`;
};

function renderComments() {
  commentList.innerHTML = "";
  const maxLike = Math.max(0, ...comments.map(c => c.likes));

  comments.forEach((c, i) => {
    const avatar = c.avatar
      ? `<img src="${c.avatar}" class="avatar-img">`
      : `<div class="avatar">${c.name[0]}</div>`;

    const el = document.createElement("div");
    el.className = "comment";
    el.innerHTML = `
      ${avatar}
      <div class="comment-body">
        <div class="comment-header">
          <b>${c.name}</b>
          ${c.likes === maxLike && c.likes > 0 ? `<span class="badge-top">🔥 Top</span>` : ""}
          ${c.edited ? `<small class="edited">(edited)</small>` : ""}
          <span class="time">${timeAgo(c.time)}</span>
        </div>
        <p>${c.text}</p>
        <div class="comment-actions">
          <span class="like" data-i="${i}">❤️ ${c.likes}</span>
          <span class="reply" data-i="${i}">Balas</span>
          <span class="edit" data-i="${i}">✏️ Edit</span>
        </div>
        <div class="reply-list">
          ${c.replies.map(r => `
            <div class="reply-item">
              <b>${r.name}</b> · <small>${timeAgo(r.time)}</small>
              <p>${r.text}</p>
            </div>`).join("")}
        </div>
      </div>`;
    commentList.appendChild(el);
  });

  commentCount.textContent = `(${comments.length + 1})`;
  localStorage.setItem("comments", JSON.stringify(comments));
}

sendBtn.onclick = () => {
  const name = nameInput.value.trim();
  const text = messageInput.value.trim();
  if (!name || !text) return alert("Nama dan komentar wajib diisi!");

  const file = avatarInput.files[0];
  if (file) {
    const r = new FileReader();
    r.onload = () => addComment(name, text, r.result);
    r.readAsDataURL(file);
  } else addComment(name, text, "");
};

function addComment(name, text, avatar) {
  comments.unshift({ name, text, avatar, time: Date.now(), likes: 0, replies: [] });
  nameInput.value = messageInput.value = avatarInput.value = "";
  renderComments();
}

commentList.onclick = e => {
  const i = e.target.dataset.i;
  if (e.target.classList.contains("like")) comments[i].likes++;
  if (e.target.classList.contains("edit")) {
    const t = prompt("Edit komentar:", comments[i].text);
    if (t) comments[i].text = t, comments[i].edited = true;
  }
  if (e.target.classList.contains("reply")) {
    const r = prompt("Balas komentar:");
    if (r) comments[i].replies.push({ name: "Guest", text: r, time: Date.now() });
  }
  renderComments();
};

renderComments();
setInterval(renderComments, 60000);

/* ===============================
   PROJECT TAB FILTER (FIX TECH)
================================ */
const tabs = document.querySelectorAll(".tab");
const projectCards = document.querySelectorAll(".project-card:not(.tech-stack)");
const techStack = document.querySelector(".tech-stack");
const indicator = document.querySelector(".tab-indicator");

function moveIndicator(el) {
  indicator.style.width = el.offsetWidth + "px";
  indicator.style.left = el.offsetLeft + "px";
}

tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    moveIndicator(tab);

    const filter = tab.dataset.filter;

    projectCards.forEach(c => c.classList.add("hide"));
    if (techStack) techStack.classList.add("hide");

    if (filter === "tech") {
      techStack.classList.remove("hide");
    } else {
      projectCards.forEach(c => {
        if (c.classList.contains(filter)) c.classList.remove("hide");
      });
    }
  };
});

moveIndicator(document.querySelector(".tab.active"));

/* ================= PROJECT DATA ================= */

const grid = document.getElementById("projectGrid");
let projects = [];

fetch("projects.json")
  .then(res => res.json())
  .then(data => {
    projects = data;
    renderProjects();
  });

function renderProjects() {
  grid.innerHTML = "";
  projects.forEach(p => {
    grid.innerHTML += `
      <div class="project-card proyek">
        <img src="${p.images[0]}" loading="lazy">
        <h3>${p.title}</h3>
        <p class="project-desc">${p.desc}</p>

        <div class="card-buttons">
          <button class="detail-btn" data-id="${p.id}">Detail</button>
        </div>
      </div>
    `;
  });
}


/* ================= MODAL HANDLER ================= */

const modal = document.getElementById("detailModal");
const title = document.getElementById("detailTitle");
const desc = document.getElementById("detailDesc");
const features = document.getElementById("detailFeatures");
const tech = document.getElementById("detailTech");
const link = document.getElementById("detailLink");
const github = document.getElementById("detailGithub");
const img = document.getElementById("detailImage"); 
let images = [];
let index = 0;

/* ================= CLICK DETAIL ================= */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".detail-btn");
  if (!btn) return;

  const data = projects.find(p => p.id === btn.dataset.id);
  if (!data) return;

  images = data.images;
  index = 0;

  // 🔥 ISI MODAL
  img.src = images[0];          
  title.textContent = data.title;
  desc.textContent  = data.desc;

  // ✨ Fitur
  features.innerHTML = "";
  data.features.forEach(f => features.innerHTML += `<li>${f}</li>`);

  // 🛠 Teknologi
  tech.innerHTML = "";
  data.tech.forEach(t => tech.innerHTML += `<span>${t}</span>`);

  // 🔗 Link
  link.href = data.link || "../beranda.html";
  github.href = data.github;

  modal.classList.add("active");
});

setInterval(() => {
  if (!modal.classList.contains("active")) return;
  index = (index + 1) % images.length;
  img.src = images[index];
}, 3000);


/* ================= CLOSE MODAL ================= */

modal.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("detail-modal") ||
    e.target.classList.contains("close-modal")
  ) {
    modal.classList.remove("active");
  }
});

/* =====================
   NAVBAR SCROLL + ACTIVE LINK
===================== */

const navbar = document.querySelector(".glass-navbar");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);

  let current = "";
  sections.forEach(sec => {
    const offset = sec.offsetTop - 140;
    const height = sec.offsetHeight;
    const top = window.scrollY;

    if (top >= offset && top < offset + height) {
      current = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${current}`
    );
  });
});


/* =====================
   ABOUT SECTION OBSERVER
   - Animate section
   - Typing effect
   - Navbar style
===================== */

const aboutSection = document.getElementById("about");
let aboutTyped = false;

const aboutTexts = {
  en: "I am a Web Developer who builds modern, clean, and user-friendly web applications.",
  id: "Saya adalah Web Developer yang membangun aplikasi web modern, rapi, dan mudah digunakan."
};

const aboutObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      // ✨ Animasi About
      aboutSection.classList.add("active", "show");

      // 🎯 Navbar berubah saat About aktif
      navbar.classList.add("about-active");

      // 🧠 Typing effect (sekali)
      if (!aboutTyped) {
        aboutTyped = true;
        typeAbout();
      }

    } else {
      // Navbar balik normal saat keluar About
      navbar.classList.remove("about-active");
    }
  });
}, { threshold: 0.6 });

aboutObserver.observe(aboutSection);

/* =====================
   Typing Effect About
===================== */
function typeAbout() {
  const el = document.getElementById("typing-about");
  if (!el) return;

  const lang = navigator.language.startsWith("id") ? "id" : "en";
  const text = aboutTexts[lang];
  let i = 0;
  el.textContent = "";

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i++);
      setTimeout(type, 35);
    }
  }
  type();
}



/* Parallax Image */
window.addEventListener("scroll", () => {
  const img = document.querySelector(".about-image img");
  if (!img) return;

  const offset = window.scrollY - aboutSection.offsetTop;
  img.style.transform = `translateY(${offset * 0.08}px)`;
});

const parallaxImg = document.querySelector(".parallax img");

document.addEventListener("mousemove", e => {
  if (!parallaxImg) return;

  const x = (window.innerWidth / 2 - e.clientX) / 35;
  const y = (window.innerHeight / 2 - e.clientY) / 35;

  parallaxImg.style.transform =
    `rotateY(${x}deg) rotateX(${-y}deg) scale(1.03)`;
});

// Disable right click
document.addEventListener("contextmenu", e => e.preventDefault());

// Disable basic devtools keys
document.addEventListener("keydown", e => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I","C","J"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});

/* ======================
   FOOTER SCRIPT
====================== */

// YEAR
document.getElementById("year").textContent =
  new Date().getFullYear();

// BACK TO TOP + PROGRESS RING
const btn = document.querySelector(".back-to-top");
const ring = document.querySelector(".progress-ring path");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = Math.min(scrollTop / docHeight, 1);

  ring.style.strokeDashoffset = 100 - progress * 100;
  btn.classList.toggle("show", scrollTop > 400);
});

btn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// FOOTER REVEAL
const footer = document.querySelector(".site-footer");

const footerObserver = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      footer.classList.add("show");
      footerObserver.disconnect();
    }
  },
  { threshold: 0.2 }
);

footerObserver.observe(footer);

// TESTIMONIAL SLIDER
const testimonials = document.querySelectorAll(".footer-testimonial");
const dots = document.querySelectorAll(".dot");

setInterval(() => {
  testimonials.forEach(t => t.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  index = (index + 1) % testimonials.length;
  testimonials[index].classList.add("active");
  dots[index].classList.add("active");
}, 4500);


window.addEventListener("scroll", () => {
  const scrollTop = document.documentElement.scrollTop;
  const height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  document.getElementById("scroll-progress").style.width =
    (scrollTop / height) * 100 + "%";
});

