try {
    console.log("Loading authController...");
    require('./controllers/authController');
    console.log("✅ authController loaded");
} catch (e) {
    console.error("❌ authController failed:", e);
}
