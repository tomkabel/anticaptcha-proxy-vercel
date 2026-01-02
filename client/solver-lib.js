/**
 * Universal Client-Side Solver
 * Connects to your private Vercel Proxy using decoy headers.
 */
const ac = {
  // Default Configuration
  _endpoint: null,
  _trackingId: null, // This is your Secret Key

  /**
   * Configure the connection
   * @param {string} url - Your Vercel API URL
   * @param {string} id - Your Secret (looks like 'G-XXXXXX')
   */
  init: function (url, id) {
    this._endpoint = url;
    this._trackingId = id;
  },

  /**
   * Solves an image captcha.
   * @param {string|HTMLElement} source - CSS Selector or Image Element
   * @returns {Promise<string>} The captcha text
   */
  solveImage: async function (source) {
    if (!this._endpoint || !this._trackingId) {
      throw "AC Client: Missing configuration. Run ac.init(url, id) first.";
    }

    let base64Body = "";

    // 1. Extract Base64 from Source
    if (source instanceof HTMLElement) {
      base64Body = await this._extractBase64(source);
    } else if (typeof source === "string") {
      const img = document.querySelector(source);
      if (!img) throw "AC Client: Image element not found";
      base64Body = await this._extractBase64(img);
    } else {
      throw "AC Client: Invalid source provided";
    }

    if (!base64Body)
      throw "AC Client: Could not process image (Empty or CORS blocked)";

    // 2. Send to Proxy with Decoy Header
    try {
      const req = await fetch(this._endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The Decoy Header (Must match Backend)
          "X-Ga-Measurement-Id": this._trackingId,
        },
        body: JSON.stringify({ imageBase64: base64Body }),
      });

      // Check for HTTP errors (like 404/401/500)
      if (!req.ok) {
        // Try to parse error message, otherwise throw status
        const errJson = await req.json().catch(() => ({}));
        throw errJson.error || `Server Error: ${req.status}`;
      }

      const res = await req.json();

      if (res.success) {
        return res.solution;
      } else {
        throw res.error || "Unknown error";
      }
    } catch (e) {
      console.error("AC Client Error:", e);
      throw e;
    }
  },

  // Internal: Convert Image to Base64
  _extractBase64: function (img) {
    return new Promise((resolve) => {
      const process = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          // Return raw base64 (strip data:image prefix)
          resolve(canvas.toDataURL("image/png").split(",")[1]);
        } catch (e) {
          console.error(
            "AC Client: Canvas tainted. Image must be same-origin."
          );
          resolve(null);
        }
      };

      if (img.complete && img.naturalHeight !== 0) process();
      else {
        img.onload = process;
        img.onerror = () => resolve(null);
      }
    });
  },
};
