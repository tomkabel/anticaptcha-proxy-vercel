// --- STEP 1: INITIALIZE ---
// Point to your secure backend and provide the "Decoy" ID
// 1. SETUP: Looks like standard analytics config
// Replace with your Vercel URL and your 'Secret' (PROXY_SECRET)
ac.init(
    "https://your-project-name.vercel.app/api",
    "G-X2885ZAQ"
);

// --- STEP 2: RUN ---
(async () => {
  console.log("🔒 Securely solving captcha...");

  try {
    // Find image, send to server, wait for result
    const text = await ac.solveImage("#captcha_img_id");

    console.log("✅ Solved:", text);

    // Fill input
    const input = document.querySelector("#captcha_input");
    if (input) {
      input.value = text;
      input.dispatchEvent(new Event("input")); // Trigger JS events
    }

    // Optional: Click login
    // document.querySelector('#login_btn').click();
  } catch (e) {
    console.error("❌ Failed:", e);
  }
})();
