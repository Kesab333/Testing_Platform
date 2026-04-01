(function () {
  const STORAGE_KEYS = {
    token: "physicx_jwt",
    email: "physicx_user_email",
    pendingEmail: "physicx_pending_email"
  };

  const API_URL = (window.CONFIG && window.CONFIG.API_URL) || "";

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function sanitizeOtp(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 6);
  }

  function getToken() {
    return localStorage.getItem(STORAGE_KEYS.token) || "";
  }

  function getStoredEmail() {
    return localStorage.getItem(STORAGE_KEYS.email) || "";
  }

  function getPendingEmail() {
    return sessionStorage.getItem(STORAGE_KEYS.pendingEmail) || "";
  }

  function storePendingEmail(email) {
    sessionStorage.setItem(STORAGE_KEYS.pendingEmail, normalizeEmail(email));
  }

  function clearPendingEmail() {
    sessionStorage.removeItem(STORAGE_KEYS.pendingEmail);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.email);
  }

  function persistSession(token, email) {
    if (!token) return;

    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(
      STORAGE_KEYS.email,
      normalizeEmail(email)
    );
  }

  function setMessage(target, type, message) {
    if (!target) return;
    target.className = `status-message status-${type} show`;
    target.textContent = message;
  }

  function clearMessage(target) {
    if (!target) return;
    target.className = "status-message";
    target.textContent = "";
  }

  async function apiRequest(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : { success: false, message: "Unexpected response from server." };

      if (!response.ok) {
        return {
          success: false,
          message: payload.message || "Request failed.",
          status: response.status,
          data: payload.data || null
        };
      }

      return {
        success: payload.success !== false,
        message: payload.message || "Request completed.",
        status: response.status,
        data: payload.data ?? payload
      };
    } catch (error) {
      return {
        success: false,
        message: "Unable to reach the PhysicX API. Please try again in a moment.",
        status: 0,
        data: null
      };
    }
  }

  function passwordLooksValid(password) {
    return String(password || "").length >= 8;
  }

  function hydratePendingEmail() {
    const pendingEmail = getPendingEmail();
    document.querySelectorAll("[data-pending-email]").forEach((node) => {
      node.textContent = pendingEmail || "no email selected";
    });

    document.querySelectorAll("[data-prefill-email]").forEach((input) => {
      if (!input.value && pendingEmail) {
        input.value = pendingEmail;
      }
    });

    document.querySelectorAll("[data-email-pill]").forEach((node) => {
      node.hidden = !pendingEmail;
    });

    document.querySelectorAll("[data-email-fallback]").forEach((node) => {
      node.hidden = Boolean(pendingEmail);
    });
  }

  function bindLogoutButtons() {
    document.querySelectorAll("[data-auth-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        clearSession();
        window.location.href = "login.html";
      });
    });
  }

  function withSubmitState(form, busyText) {
    const submit = form.querySelector("button[type='submit']");
    if (!submit) return () => {};
    submit.disabled = true;
    submit.dataset.originalText = submit.dataset.originalText || submit.textContent;
    submit.textContent = busyText;
    return () => {
      submit.disabled = false;
      submit.textContent = submit.dataset.originalText;
    };
  }

  function bindRegisterForm() {
    const form = document.getElementById("register-form");
    const message = document.getElementById("register-message");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(message);

      const email = normalizeEmail(form.email.value);
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;

      if (!email) {
        setMessage(message, "error", "Enter a valid email address.");
        return;
      }

      if (!passwordLooksValid(password)) {
        setMessage(message, "error", "Use at least 8 characters for your password.");
        return;
      }

      if (password !== confirmPassword) {
        setMessage(message, "error", "Password confirmation does not match.");
        return;
      }

      const release = withSubmitState(form, "Creating account...");
      const result = await apiRequest("/register", {
        method: "POST",
        body: { email, password }
      });
      release();

      if (!result.success) {
        setMessage(message, "error", result.message);
        return;
      }

      storePendingEmail(email);
      setMessage(message, "success", result.message);
      window.setTimeout(() => {
        window.location.href = "verify-otp.html";
      }, 900);
    });
  }

  function bindLoginForm() {
    const form = document.getElementById("login-form");
    const message = document.getElementById("login-message");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(message);

      const email = normalizeEmail(form.email.value);
      const password = form.password.value;

      if (!email || !password) {
        setMessage(message, "error", "Enter both your email and password.");
        return;
      }

      const release = withSubmitState(form, "Logging in...");
      const result = await apiRequest("/login", {
        method: "POST",
        body: { email, password }
      });
      release();

      if (!result.success) {
        setMessage(message, "error", result.message);
        return;
      }

      /* ---- FIX: read access_token ---- */

      const token =
        result.data?.access_token ||
        result.data?.token ||
        result.access_token ||
        "";

      if (!token) {
        setMessage(
          message,
          "error",
          "Login succeeded but token missing from server response."
        );
        return;
      }

      persistSession(token, email);

      clearPendingEmail();

      setMessage(message, "success", result.message);

      window.setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 700);
    });
  }

  function bindForgotPasswordForm() {
    const form = document.getElementById("forgot-password-form");
    const message = document.getElementById("forgot-password-message");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(message);

      const email = normalizeEmail(form.email.value);
      if (!email) {
        setMessage(message, "error", "Enter the email address linked to your account.");
        return;
      }

      const release = withSubmitState(form, "Sending code...");
      const result = await apiRequest("/forgot-password", {
        method: "POST",
        body: { email }
      });
      release();

      if (!result.success) {
        setMessage(message, "error", result.message);
        return;
      }

      storePendingEmail(email);
      setMessage(message, "success", result.message);
      window.setTimeout(() => {
        window.location.href = "reset-password.html";
      }, 1000);
    });
  }

  function bindResetPasswordForm() {
    const form = document.getElementById("reset-password-form");
    const message = document.getElementById("reset-password-message");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearMessage(message);

      const email = normalizeEmail(form.email.value || getPendingEmail());
      const otpCode = sanitizeOtp(form.otpCode.value);
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;

      if (!email) {
        setMessage(message, "error", "Enter the email address you used for the reset request.");
        return;
      }

      if (otpCode.length !== 6) {
        setMessage(message, "error", "Enter the full 6-digit reset code.");
        return;
      }

      if (!passwordLooksValid(password)) {
        setMessage(message, "error", "Use at least 8 characters for your new password.");
        return;
      }

      if (password !== confirmPassword) {
        setMessage(message, "error", "Password confirmation does not match.");
        return;
      }

      const release = withSubmitState(form, "Updating password...");
      const result = await apiRequest("/reset-password", {
        method: "POST",
        body: {
          email,
          otp_code: otpCode,
          new_password: password
        }
      });
      release();

      if (!result.success) {
        setMessage(message, "error", result.message);
        return;
      }

      clearPendingEmail();
      setMessage(message, "success", result.message);
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 1100);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydratePendingEmail();
    bindRegisterForm();
    bindLoginForm();
    bindForgotPasswordForm();
    bindResetPasswordForm();
    bindLogoutButtons();
  });

  window.PhysicXAuth = {
    apiRequest,
    clearPendingEmail,
    clearSession,
    getPendingEmail,
    getStoredEmail,
    getToken,
    hydratePendingEmail,
    persistSession,
    setMessage
  };
})();
