const express = require("express");

const app = express();

app.use(express.json());
app.use("/", require("./routes/auth.js"));

app.get("/", (req, res) => {
  res.status(200).send("hello, express");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
