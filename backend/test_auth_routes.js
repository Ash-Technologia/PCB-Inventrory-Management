try {
    console.log("Loading auth.routes...");
    require('./routes/auth.routes');
    console.log("✅ auth.routes loaded");
} catch (e) {
    console.error("❌ auth.routes failed:", e);
}
