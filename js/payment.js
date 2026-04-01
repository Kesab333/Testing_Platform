(function () {
  const API_URL = (window.CONFIG && window.CONFIG.API_URL) || "";
  const RAZORPAY_KEY_ID = (window.CONFIG && window.CONFIG.RAZORPAY_KEY_ID) || "rzp_test_dummy_key";
  const STORAGE_KEYS = {
    token: "physicx_jwt",
    email: "physicx_user_email",
    lastPlan: "physicx_last_plan",
    lastOrderId: "physicx_last_order_id"
  };

  function getToken() {
    return localStorage.getItem(STORAGE_KEYS.token) || "";
  }

  function getEmail() {
    return localStorage.getItem(STORAGE_KEYS.email) || "";
  }

  function setMessage(target, type, message) {
    if (!target) return;
    target.className = `status-message status-${type} show`;
    target.textContent = message;
  }

  function setBusyState(plan, isBusy) {
    document.querySelectorAll("[data-buy-plan]").forEach((button) => {
      const matchesPlan = button.getAttribute("data-buy-plan") === plan;
      button.disabled = isBusy;
      if (matchesPlan) {
        if (isBusy) {
          button.dataset.originalText = button.dataset.originalText || button.textContent;
          button.textContent = "Preparing checkout...";
        } else if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    });
  }

  async function createOrder(plan) {
    const token = getToken();
    const response = await fetch(`${API_URL}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ plan })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || "Unable to create the Razorpay order.");
    }
    return payload;
  }

  function openRazorpayCheckout(data, plan) {
    if (typeof window.Razorpay !== "function") {
      throw new Error("Razorpay Checkout is unavailable on this page.");
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency || "INR",
      order_id: data.order_id,
      name: "PhysicX",
      description: "Software License",
      prefill: {
        email: getEmail()
      },
      handler: function () {
        sessionStorage.setItem(STORAGE_KEYS.lastPlan, plan);
        sessionStorage.setItem(STORAGE_KEYS.lastOrderId, data.order_id);
        window.location.href = "success.html";
      },
      theme: {
        color: "#2563eb"
      }
    };

    const checkout = new window.Razorpay(options);
    checkout.on("payment.failed", function (event) {
      const reason = event && event.error && event.error.description
        ? event.error.description
        : "Payment could not be completed.";
      const target = document.getElementById("pricing-message");
      setMessage(target, "error", reason);
    });
    checkout.open();
  }

  async function buyPlan(plan) {
    const target = document.getElementById("pricing-message");
    const token = getToken();
    if (!token) {
      setMessage(target, "warning", "Please log in before purchasing a paid PhysicX license.");
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
      return;
    }

    try {
      setBusyState(plan, true);
      setMessage(target, "info", "Creating your secure Razorpay order...");
      const order = await createOrder(plan);
      setMessage(target, "success", "Order created. Opening Razorpay checkout...");
      openRazorpayCheckout(order, plan);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start checkout.";
      setMessage(target, "error", message);
    } finally {
      setBusyState(plan, false);
    }
  }

  async function pollLicenseActivation(options = {}) {
    const {
      attempts = 12,
      delayMs = 2500
    } = options;
    const token = getToken();
    if (!token) return false;

    for (let index = 0; index < attempts; index += 1) {
      try {
        const response = await fetch(`${API_URL}/license-status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) {
          const licenseType = String(payload.license_type || "").toLowerCase();
          const status = String(payload.status || "").toLowerCase();
          if (status === "active" && (licenseType === "monthly" || licenseType === "yearly")) {
            return true;
          }
        }
      } catch (error) {
        // Keep polling through transient failures while the webhook settles.
      }

      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }

    return false;
  }

  async function runSuccessFlow() {
    const message = document.getElementById("success-message");
    const detail = document.getElementById("success-detail");
    if (!message || !detail) return;

    setMessage(message, "info", "Payment acknowledged. Waiting for backend license activation...");
    detail.textContent = "Razorpay confirmed the checkout. PhysicX is now syncing the paid license on the backend.";

    const activated = await pollLicenseActivation();
    if (activated) {
      setMessage(message, "success", "Paid license activated successfully.");
      detail.textContent = "Your dashboard now reflects the updated license. Redirecting you there now.";
    } else {
      setMessage(message, "warning", "Payment succeeded, but license activation is still syncing.");
      detail.textContent = "This can happen when the webhook arrives a few seconds later. We are sending you to the dashboard so you can refresh the latest status.";
    }

    window.setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1800);
  }

  function hydratePricingPage() {
    const emailNode = document.getElementById("pricing-email");
    if (emailNode) {
      emailNode.textContent = getEmail() || "Not signed in";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydratePricingPage();
    if (document.body.dataset.page === "payment-success") {
      runSuccessFlow();
    }
  });

  window.buyPlan = buyPlan;
  window.PhysicXPayments = {
    buyPlan,
    pollLicenseActivation
  };
})();
