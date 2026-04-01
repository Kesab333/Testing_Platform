const CONFIG = Object.freeze({
  API_URL: "https://physicx-api.onrender.com",
  APP_NAME: "PhysicX",
  RAZORPAY_KEY_ID: "rzp_test_dummy_key",
  OTP_EXPIRY_MINUTES: 10,
  HEARTBEAT_INTERVAL: 86400,
  OFFLINE_GRACE_HOURS: 168
});

window.CONFIG = CONFIG;
