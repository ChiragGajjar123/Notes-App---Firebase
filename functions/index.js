const { onRequest } = require("firebase-functions/v2/https");
const next = require("next");
const app = next({ dev: false, dir: "./" });
const handle = app.getRequestHandler();

exports.nextjsServer = onRequest({ memory: "1GiB", timeoutSeconds: 60 }, async (req, res) => {
  await app.prepare();
  return handle(req, res);
});
