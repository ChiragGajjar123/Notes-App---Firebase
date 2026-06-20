const { onRequest } = require("firebase-functions/v2/https");
const next = require("next");

const app = next({ dev: false, dir: "./" });

// Prepare the Next.js app once at cold start, not on every request
const preparePromise = app.prepare();
const handle = app.getRequestHandler();

exports.nextjsServer = onRequest(
  { memory: "1GiB", timeoutSeconds: 60, region: "us-central1" },
  async (req, res) => {
    await preparePromise; // reuses the already-prepared instance on warm requests
    return handle(req, res);
  }
);
