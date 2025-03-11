const Redis = require("ioredis");
const express = require("express");
const app = express();

const redis = new Redis({
  port: 6379,
  host: "localhost",
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false,
});

const init = async () => {
  await redis.flushdb();
  await Promise.all([
    redis.set(
      "greets:1",
      JSON.stringify({ id: 1, message: "Hello! Welcome!" })
    ),
    redis.set("greets:2", JSON.stringify({ id: 2, message: "Good Day~" })),
    redis.set(
      "greets:3",
      JSON.stringify({ id: 3, message: "Have a nice day :D" })
    ),
  ]);
};

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

app.get("/greet/:id", greetMiddleware, async (req, res) => {
  try {
    const key = `greets:${req.params.id}`;
    const val = await redis.get(key);
    const greet = JSON.parse(val);
    res.status(200).send(greet.message);
  } catch (err) {
    console.error(err);
    res.status(500).send("internal error");
  }
});

redis.once("ready", async () => {
  try {
    await init();
    app.listen(3000, () => {
      console.log("Server is listening on port 3000");
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

redis.on("error", (err) => {
  console.error(err);
  process.exit(1);
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
