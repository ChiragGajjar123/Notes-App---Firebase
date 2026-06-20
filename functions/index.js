const { onRequest } = require("firebase-functions/v2/https");

let app;
let handle;
let preparePromise;

function getRequestHandler() {
  if (!app) {
    const next = require("next");
    app = next({ dev: false, dir: "./" });
    preparePromise = app.prepare();
    handle = app.getRequestHandler();
  }
  return { handle, preparePromise };
}

exports.nextjsServer = onRequest(
  { memory: "1GiB", timeoutSeconds: 60, region: "us-central1" },
  async (req, res) => {
    const { handle, preparePromise } = getRequestHandler();
    await preparePromise;
    return handle(req, res);
  }
);
