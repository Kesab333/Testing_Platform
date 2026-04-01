(function () {
  function sanitizeOtp(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 6);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.PhysicXAuth) return;

    window.PhysicXAuth.hydratePendingEmail();

    const form = document.getElementById("verify-otp-form");
    const message = document.getElementById("verify-otp-message");
    if (!form) return;

    const otpInput = form.querySelector("input[name='otpCode']");
    otpInput.addEventListener("input", () => {
      otpInput.value = sanitizeOtp(otpInput.value);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = String(form.email.value || window.PhysicXAuth.getPendingEmail() || "").trim().toLowerCase();
      const otpCode = sanitizeOtp(form.otpCode.value);

      if (!email) {
        window.PhysicXAuth.setMessage(message, "error", "We could not find the account email. Enter it and try again.");
        return;
      }

      if (otpCode.length !== 6) {
        window.PhysicXAuth.setMessage(message, "error", "Enter the full 6-digit verification code.");
        return;
      }

      const submit = form.querySelector("button[type='submit']");
      submit.disabled = true;
      submit.dataset.originalText = submit.dataset.originalText || submit.textContent;
      submit.textContent = "Verifying...";

      const result = await window.PhysicXAuth.apiRequest("/verify-otp", {
        method: "POST",
        body: {
          email,
          otp_code: otpCode
        }
      });

      submit.disabled = false;
      submit.textContent = submit.dataset.originalText;

      if (!result.success) {
        window.PhysicXAuth.setMessage(message, "error", result.message);
        return;
      }

      window.PhysicXAuth.clearPendingEmail();
      window.PhysicXAuth.setMessage(message, "success", result.message);
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    });
  });
})();
