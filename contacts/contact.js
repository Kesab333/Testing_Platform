/**
 * contact.js — PhysicX Contact Page Logic
 * Handles form validation, submission simulation, and reveal animations.
 */

(() => {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────── */

  const $ = (sel, root = document) => root.querySelector(sel);
  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  /* ── DOM refs ─────────────────────────────────────────── */

  const form        = $('#contact-form');
  const btnSubmit   = $('#btn-submit');
  const msgSuccess  = $('#form-success');
  const msgError    = $('#form-error');

  const fields = {
    name:    { el: $('#inp-name'),    group: $('#fg-name'),    validate: v => v.trim().length >= 2 },
    email:   { el: $('#inp-email'),   group: $('#fg-email'),   validate: v => isValidEmail(v) },
    subject: { el: $('#inp-subject'), group: $('#fg-subject'), validate: v => v !== '' },
    message: { el: $('#inp-message'), group: $('#fg-message'), validate: v => v.trim().length >= 10 },
  };

  /* ── Field-level validation ───────────────────────────── */

  function validateField(key) {
    const { el, group, validate } = fields[key];
    const valid = validate(el.value);
    el.classList.toggle('error', !valid);
    group.classList.toggle('show-error', !valid);
    return valid;
  }

  function validateAll() {
    return Object.keys(fields)
      .map(k => validateField(k))
      .every(Boolean);
  }

  /* Attach blur-time inline validation */
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    el.addEventListener('blur', () => validateField(key));
    el.addEventListener('input', () => {
      /* Clear error once user starts fixing */
      if (el.classList.contains('error')) validateField(key);
    });
  });

  /* ── Status message helpers ───────────────────────────── */

  function hideStatus() {
    msgSuccess.classList.remove('visible');
    msgError.classList.remove('visible');
  }

  function showSuccess() {
    hideStatus();
    msgSuccess.classList.add('visible');
    msgSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showError() {
    hideStatus();
    msgError.classList.add('visible');
  }

  /* ── Loading state ────────────────────────────────────── */

  function setLoading(loading) {
    btnSubmit.classList.toggle('loading', loading);
    btnSubmit.disabled = loading;
    btnSubmit.setAttribute('aria-busy', String(loading));
  }

  /* ── Form reset ───────────────────────────────────────── */

  function resetForm() {
    form.reset();
    Object.keys(fields).forEach(key => {
      const { el, group } = fields[key];
      el.classList.remove('error');
      group.classList.remove('show-error');
    });
  }

  /* ── Simulated submit (replace with real endpoint) ──────
   *
   *  To wire a real backend, replace simulateSubmit() with:
   *
   *  const resp = await fetch('/api/contact', {
   *    method: 'POST',
   *    headers: { 'Content-Type': 'application/json' },
   *    body: JSON.stringify(payload),
   *  });
   *  if (!resp.ok) throw new Error('Server error');
   *
   * ─────────────────────────────────────────────────────── */

  function simulateSubmit(payload) {
    return new Promise((resolve, reject) => {
      console.info('[PhysicX Contact] Payload:', payload);
      /* Simulate ~1.4 s network latency */
      setTimeout(() => {
        /* Always resolves in demo mode. Set to reject() to test error path. */
        resolve({ ok: true });
      }, 1400);
    });
  }

  /* ── Submit handler ───────────────────────────────────── */

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideStatus();

      if (!validateAll()) {
        /* Focus first error field */
        const firstError = Object.values(fields).find(f => f.el.classList.contains('error'));
        if (firstError) firstError.el.focus();
        return;
      }

      const payload = {
        name:    fields.name.el.value.trim(),
        email:   fields.email.el.value.trim(),
        subject: fields.subject.el.value,
        message: fields.message.el.value.trim(),
      };

      setLoading(true);

      try {
        await simulateSubmit(payload);
        resetForm();
        showSuccess();
      } catch {
        showError();
      } finally {
        setLoading(false);
      }
    });
  }

  /* ── Scroll-reveal (if shared.css uses IntersectionObserver) ──
   *
   *  PhysicX shared.css handles .reveal/.reveal-delay-* via its own
   *  observer in nav.js or a global initializer. This block is a
   *  safe fallback in case contact.html loads before that runs.
   * ─────────────────────────────────────────────────────────── */

  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      /* Graceful degradation: just show everything */
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => observer.observe(el));
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }

})();
