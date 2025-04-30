const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use("/", require("./routes/auth.js"));

app.get("/", (req, res) => {
  res.status(200).send("hello, express");
});

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
