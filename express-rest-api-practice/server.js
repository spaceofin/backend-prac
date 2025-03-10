const express = require("express");
const app = express();

app.get(
  "/",
  (req, res, next) => {
    console.log("This is express study");
    next();
  },
  (req, res) => {
    res.status(200).send("hello world");
  }
);

const greetMiddleware = (req, res, next) => {
  console.log("This is greet route.");
  next();
};

app.get("/greet", greetMiddleware, (req, res) => {
  res.status(200).send("Welcome!");
});

app.get("/greet/:username", greetMiddleware, (req, res) => {
  res.status(200).send(`hello, ${req.params.username}`);
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
