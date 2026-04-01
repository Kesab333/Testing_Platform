(function () {
  function initialsFromEmail(email) {
    const localPart = String(email || "").split("@")[0] || "PX";
    return localPart.slice(0, 2).toUpperCase();
  }

  function formatDate(value) {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function setLicenseMessage(status, message) {
    const node = document.getElementById("dashboard-license-message");
    if (!node) return;

    const toneByStatus = {
      active: "success",
      expired: "warning",
      revoked: "error"
    };

    node.className = `status-message status-${toneByStatus[status] || "info"} show`;
    node.textContent = message || "License state loaded.";
  }

  function setDeviceWarning(remainingChanges) {
    const node = document.getElementById("dashboard-device-warning");
    if (!node) return;

    if (typeof remainingChanges !== "number" || remainingChanges > 2) {
      node.style.display = "none";
      node.textContent = "";
      return;
    }

    if (remainingChanges <= 0) {
      node.textContent =
        "Device change limit reached. This device remains active, but future switches require support@physicx.in.";
    } else {
      node.textContent =
        `Warning: You have only ${remainingChanges} device change${remainingChanges === 1 ? "" : "s"} remaining. Please avoid unnecessary device switches.`;
    }
    node.style.display = "block";
  }

  function resolveDaysRemaining(licenseData) {
    if (typeof licenseData.days_remaining === "number") {
      return licenseData.days_remaining;
    }
    if (typeof licenseData.remaining_days === "number") {
      return licenseData.remaining_days;
    }
    if (!licenseData.expiry_date) {
      return 0;
    }

    const today = new Date();
    const expiry = new Date(licenseData.expiry_date);
    const diff = expiry.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  function resolveProgressPercent(licenseData, daysRemaining) {
    if (licenseData.trial_start && licenseData.trial_end) {
      const trialStart = new Date(licenseData.trial_start);
      const trialEnd = new Date(licenseData.trial_end);
      const total = trialEnd.getTime() - trialStart.getTime();
      const remaining = trialEnd.getTime() - Date.now();
      if (total > 0) {
        return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
      }
    }

    if ((licenseData.license_type || "").toLowerCase() === "trial") {
      return Math.max(0, Math.min(100, Math.round((daysRemaining / 7) * 100)));
    }

    return licenseData.status === "active" ? 100 : 0;
  }

  function desktopReadiness(licenseData) {
    const status = String(licenseData.status || "").toLowerCase();
    if (status === "active") return "Installer-ready";
    if (status === "expired") return "Renewal required";
    if (status === "revoked") return "Access revoked";
    return "Pending";
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (!window.PhysicXAuth) return;

    const token = window.PhysicXAuth.getToken();
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const storedEmail = window.PhysicXAuth.getStoredEmail();
    setText("dashboard-email", storedEmail || "Loading...");
    setText("dashboard-avatar", initialsFromEmail(storedEmail));

    const [profile, license] = await Promise.all([
      window.PhysicXAuth.apiRequest("/me", { token }),
      window.PhysicXAuth.apiRequest("/license-status", { token })
    ]);

    if (!profile.success) {
      window.PhysicXAuth.clearSession();
      window.location.href = "login.html";
      return;
    }

    if (!license.success && license.status === 401) {
      window.PhysicXAuth.clearSession();
      window.location.href = "login.html";
      return;
    }

    const profileData = profile.data || {};
    const licenseData = license.data || {};
    const daysRemaining = resolveDaysRemaining(licenseData);
    const remainingPercent = resolveProgressPercent(licenseData, daysRemaining);

    setText("dashboard-email", profileData.email || storedEmail || "Unknown user");
    setText("dashboard-avatar", initialsFromEmail(profileData.email || storedEmail));
    setText("dashboard-license-type", licenseData.license_type || "Unknown");
    setText("dashboard-license-status", licenseData.status || "Unknown");
    setText("dashboard-expiry", formatDate(licenseData.expiry_date));
    setText("dashboard-days-remaining", `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`);
    setText("dashboard-sync-state", desktopReadiness(licenseData));
    setText("dashboard-verification", profileData.is_verified ? "Verified" : "Pending");
    setText("dashboard-current-device", licenseData.current_device_name || "No active device");
    setText(
      "dashboard-device-changes-used",
      `${licenseData.device_changes_used ?? 0} / ${licenseData.max_device_changes ?? 5}`
    );
    setText(
      "dashboard-remaining-device-changes",
      `${licenseData.remaining_device_changes ?? Math.max(0, (licenseData.max_device_changes ?? 5) - (licenseData.device_changes_used ?? 0))}`
    );
    setLicenseMessage(licenseData.status, licenseData.message);
    setDeviceWarning(licenseData.remaining_device_changes);

    const fill = document.getElementById("dashboard-license-fill");
    if (fill) {
      fill.style.width = `${remainingPercent}%`;
    }
  });
})();
