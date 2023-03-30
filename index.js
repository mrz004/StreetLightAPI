const express = require("express");
const fs = require("fs");
const filename = "data.json";
const port = process.env.PORT ?? 3000;
const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
const ip = results["en0"][0];

const app = express();
const { key, data } = JSON.parse(
  fs.readFileSync(filename, { encoding: "utf-8" })
);

const saveData = () =>
  fs.writeFileSync(filename, JSON.stringify({ key, data }, null, "  "));

const auth = (req, res, next) => {
  // console.log("in auth")
  if (req.query.key !== key) res.status(401).send("Authentication Error!");
  else next();
};

app.use("/status", auth);
app.use("/set", auth);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/templates/index.html");
});

app.get("/status", (req, res) => {
//   console.log("in /status", req.query);
  const { query } = req;
  // res.set("content-type", "text")

  // res.send("hello")

  if (query.hasOwnProperty("id")) {
    if (data.hasOwnProperty(query.id)) res.send(data[query.id]);
    else res.status(401).send("Invalid id!");
  } else {
    res.send(JSON.stringify(data));
    // console.log(JSON.stringify(data));
  }
});

app.get("/set", (req, res) => {
  console.log("in /set", req.query);
  res.set("content-type", "application/json");
  const { query } = req;
  // console.log(query)

  if (
    query.hasOwnProperty("id") &&
    data.hasOwnProperty(query.id) &&
    query.hasOwnProperty("value")
  ) {
    data[query.id] = query.value == 1 ? "1" : "0";
    // console.log("data",data)
  }

  saveData();

  res.send(data);
});

app.listen(port, () => {
  console.log(`Server Started on port ${ip}:${port}`);
});
