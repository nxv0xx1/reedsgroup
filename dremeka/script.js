/* ============================================
   script.js — Dr. Wachuku Personal Site
   Handles: Navigation, Scroll Reveal, Blog System
   ============================================ */

(function () {
  'use strict';

  // ─── Navigation ───────────────────────────────
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  // Sticky navbar background on scroll
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // ─── Scroll Reveal ────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  function checkReveal() {
    const windowHeight = window.innerHeight;
    revealElements.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      const revealPoint = 80;
      if (elementTop < windowHeight - revealPoint) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkReveal);
  window.addEventListener('load', checkReveal);

  // ─── Blog System ──────────────────────────────
  const blogListEl = document.getElementById('blogList');
  const blogEmptyEl = document.getElementById('blogEmpty');
  const blogListView = document.getElementById('blogListView');
  const blogPostView = document.getElementById('blogPostView');
  const blogPostHeader = document.getElementById('blogPostHeader');
  const blogPostBody = document.getElementById('blogPostBody');
  const blogBackBtn = document.getElementById('blogBackBtn');

  // Only run blog logic on blog.html
  if (blogListEl) {
    initBlog();
  }

  async function initBlog() {
    // Check if URL has a ?post= query param
    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');

    try {
      const res = await fetch('blogs.json');
      if (!res.ok) throw new Error('Could not load blogs.json');
      const blogs = await res.json();

      if (postSlug) {
        const post = blogs.find((b) => b.slug === postSlug);
        if (post) {
          showPost(post);
        } else {
          renderBlogList(blogs);
        }
      } else {
        renderBlogList(blogs);
      }
    } catch (err) {
      console.warn('Blog system:', err.message);
      if (blogEmptyEl) {
        blogEmptyEl.style.display = 'block';
      }
    }
  }

  function renderBlogList(blogs) {
    if (!blogs || blogs.length === 0) {
      if (blogEmptyEl) blogEmptyEl.style.display = 'block';
      return;
    }

    // Sort by date descending
    blogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    blogListEl.innerHTML = blogs
      .map(
        (post) => `
      <a class="glass-card blog-card" href="?post=${post.slug}" onclick="return false;" data-slug="${post.slug}">
        <div class="blog-card-image">
          <img src="${post.image || 'assets/images/blog-default.jpg'}" alt="${post.title}" onerror="this.style.display='none'">
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">${formatDate(post.date)}${post.tags ? ' · ' + post.tags[0] : ''}</div>
          <div class="blog-card-title">${post.title}</div>
          <div class="blog-card-excerpt">${post.excerpt || ''}</div>
          <div class="blog-card-read">Read article →</div>
        </div>
      </a>
    `
      )
      .join('');

    // Add click handlers
    blogListEl.querySelectorAll('.blog-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const slug = card.dataset.slug;
        const post = blogs.find((b) => b.slug === slug);
        if (post) {
          window.history.pushState({}, '', `?post=${slug}`);
          showPost(post);
        }
      });
    });
  }

  async function showPost(post) {
    // Switch views
    if (blogListView) blogListView.style.display = 'none';
    if (blogPostView) blogPostView.style.display = 'block';

    // Render header
    if (blogPostHeader) {
      blogPostHeader.innerHTML = `
        <div class="blog-post-date">${formatDate(post.date)}</div>
        <h1>${post.title}</h1>
        ${post.excerpt ? `<p class="blog-post-excerpt">${post.excerpt}</p>` : ''}
      `;
    }

    // Fetch and render Markdown
    if (blogPostBody) {
      try {
        const res = await fetch(`blogs/${post.slug}.md`);
        if (!res.ok) throw new Error('Post file not found');
        const md = await res.text();
        blogPostBody.innerHTML = marked.parse(md);
      } catch (err) {
        blogPostBody.innerHTML = `<p style="color: var(--text-muted);">Could not load this post. Please try again later.</p>`;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Back button
  if (blogBackBtn) {
    blogBackBtn.addEventListener('click', () => {
      window.history.pushState({}, '', 'blog.html');
      if (blogPostView) blogPostView.style.display = 'none';
      if (blogListView) blogListView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('post')) {
      initBlog();
    } else {
      if (blogPostView) blogPostView.style.display = 'none';
      if (blogListView) blogListView.style.display = 'block';
    }
  });

  // ─── Helpers ──────────────────────────────────
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // ─── Profile Image Fallback ───────────────────
  const heroImg = document.getElementById('heroProfileImage');
  if (heroImg) {
    heroImg.addEventListener('error', () => {
      // Create a stylish placeholder gradient if no image is available
      heroImg.parentElement.style.background =
        'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)';
      heroImg.style.display = 'none';
    });
  }
})();
