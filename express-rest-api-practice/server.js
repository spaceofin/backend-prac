const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

app.get("/greet/:username", (req, res) => {
  res.status(200).send(`hello, ${req.params.username}`);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
