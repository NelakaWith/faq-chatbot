const https = require("https");
https.get("https://registry.npmjs.org/@changesets/cli", (res) => {
  let s = "";
  res.on("data", (c) => (s += c));
  res.on("end", () => {
    const info = JSON.parse(s);
    const versions = Object.keys(info.versions);
    console.log("Available versions (last 8):", versions.slice(-8));
  });
});
