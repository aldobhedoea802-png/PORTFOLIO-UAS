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

document.addEventListener("DOMContentLoaded", () => {

/* ===== MEDIA TABS ===== */
document.querySelectorAll(".media-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".media-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    document.querySelectorAll(".media-grid").forEach(g => g.classList.remove("active"));
    document.querySelector(`.media-grid.${tab.dataset.media}`)?.classList.add("active");
  };
});

/* ===== PHOTO LIGHTBOX ===== */
const lightbox = document.getElementById("photoLightbox");
const imgBox = document.getElementById("lightboxImg");
const caption = document.getElementById("lightboxCaption");
const images = [...document.querySelectorAll(".media-grid.photo img")];
const nextBtn = document.querySelector(".lightbox-nav.next");
const prevBtn = document.querySelector(".lightbox-nav.prev");
const closeBtn = document.querySelector(".lightbox-close");


let photoIndex = 0;

/* OPEN */
images.forEach((img, i) => {
  img.addEventListener("click", () => {
    if (!img.closest(".media-grid.photo.active")) return; // 🔥 GUARD
    openPhoto(i);
  });
});

function openPhoto(i) {
  photoIndex = i;
  updatePhoto();
  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";
}

function updatePhoto() {
  imgBox.style.opacity = 0;
  setTimeout(() => {
    imgBox.src = images[photoIndex].src;
    caption.textContent = images[photoIndex].alt || "";
    imgBox.style.opacity = 1;
  }, 120);
}

/* NAV */
nextBtn.onclick = () => {
  photoIndex = (photoIndex + 1) % images.length;
  updatePhoto();
};

prevBtn.onclick = () => {
  photoIndex = (photoIndex - 1 + images.length) % images.length;
  updatePhoto();
};

/* CLOSE */
function close() {
  lightbox.classList.remove("show");
  document.body.style.overflow = "";
}
closeBtn.onclick = close;
lightbox.addEventListener("click", e => e.target === lightbox && close());

/* KEYBOARD */
document.addEventListener("keydown", e => {
  if (!lightbox.classList.contains("show")) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowRight") nextBtn.click();
  if (e.key === "ArrowLeft") prevBtn.click();
});

/* 3D TILT */
imgBox.addEventListener("mousemove", e => {
  const r = imgBox.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const rx = ((y / r.height) - 0.5) * -10;
  const ry = ((x / r.width) - 0.5) * 10;
  imgBox.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
});
imgBox.addEventListener("mouseleave", () => {
  imgBox.style.transform = "rotateX(0) rotateY(0) scale(1)";
});

/* SWIPE */
let startX = 0;
imgBox.addEventListener("touchstart", e => startX = e.touches[0].clientX);
imgBox.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) nextBtn.click();
  if (endX - startX > 50) prevBtn.click();
});


/* ===== VIDEO MODAL ===== */
const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");

/* HANYA VIDEO */
document.querySelectorAll(".media-grid.video .media-item").forEach(card => {
  const video = card.querySelector("video");
  const bar = card.querySelector(".video-progress span");

  card.addEventListener("mouseenter", () => {
    video.currentTime = 0;
    video.play();
  });

  card.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
    bar.style.width = "0%";
  });

  video.addEventListener("timeupdate", () => {
    bar.style.width = (video.currentTime / video.duration) * 100 + "%";
  });

  card.addEventListener("click", () => {
    videoModal.classList.add("show");
    modalVideo.src = video.src;
    modalVideo.play();
    document.body.style.overflow = "hidden";
  });
});



/* JANGAN TUTUP SAAT VIDEO DIKLIK */
modalVideo.addEventListener("click", e => e.stopPropagation());

/* TUTUP HANYA BACKGROUND */
videoModal.addEventListener("click", e => {
  if (e.target === videoModal) closeVideo();
});

function closeVideo() {
  modalVideo.pause();
  modalVideo.src = "";
  videoModal.classList.remove("show");
  document.body.style.overflow = "";
}


/* ===== MUSIC PLAYER ===== */
const playlist = [
  { title: "Cyber Night", src: "music/Audio 2026-01-04 at 02.03.58.mpeg" }
];

let musicIndex = 0;
const audio = document.getElementById("audio");
const title = document.getElementById("songTitle");
const play = document.getElementById("play");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
const progress = document.getElementById("progress");
const current = document.getElementById("currentTime");
const duration = document.getElementById("duration");

function loadTrack() {
  audio.src = playlist[musicIndex].src;
  title.textContent = playlist[musicIndex].title;
}
loadTrack();

play.onclick = () => {
  audio.paused ? audio.play() : audio.pause();
};

next.onclick = () => {
  musicIndex = (musicIndex + 1) % playlist.length;
  loadTrack();
  audio.play();
};

prev.onclick = () => {
  musicIndex = (musicIndex - 1 + playlist.length) % playlist.length;
  loadTrack();
  audio.play();
};

audio.ontimeupdate = () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  current.textContent = format(audio.currentTime);
  duration.textContent = format(audio.duration);
};

progress.oninput = () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
};

function format(sec) {
  if (isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" + s : s}`;
}

});

