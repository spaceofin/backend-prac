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

const errorOccurMiddleware = (req, res, next) => {
  console.log("error");
  next(new Error("Error Occurred"));
};

app.get("/error", errorOccurMiddleware, (req, res) => {
  res.status(200).send("This is error page");
});

app.get("/error-throw", (req, res) => {
  throw new Error("Error Thrown");
});

app.get("/not-found", (req, res, next) => {
  const error = new Error("Sometihne went wrong!");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send("Page not found");
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send("Internal Server Error");
});
