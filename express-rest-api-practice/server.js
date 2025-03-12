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
  await redis.mset(
    "greets:1",
    JSON.stringify({ id: 1, message: "Hello! Welcome!" }),
    "greets:2",
    JSON.stringify({ id: 2, message: "Good Day~" }),
    "greets:3",
    JSON.stringify({ id: 3, message: "Have a nice day :D" }),
    "greets:4",
    JSON.stringify({
      id: 4,
      message: "Seize the day with joy and passion!",
    }),
    "greets:5",
    JSON.stringify({ id: 5, message: "Greetings from the sunny side!" }),
    "greets:6",
    JSON.stringify({ id: 6, message: "Wishing you all the best today!" }),
    "greets:7",
    JSON.stringify({ id: 7, message: "Enjoy every moment of today!" }),
    "greets:8",
    JSON.stringify({ id: 8, message: "Smile and have a wonderful day!" }),
    "greets:9",
    JSON.stringify({ id: 9, message: "Make today amazing!" }),
    "greets:10",
    JSON.stringify({ id: 10, message: "Stay positive and keep shining!" })
  );

  await Promise.all([
    redis.rpush(
      "greets:list",
      JSON.stringify({ id: 1, message: "Hey~ Hello! Welcome!" })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({ id: 2, message: "Hey~ Good Day~" })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({ id: 3, message: "Hey~ Have a nice day :D" })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({
        id: 4,
        message: "Hey~ Seize the day with joy and passion!",
      })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({
        id: 5,
        message: "Hey~ Greetings from the sunny side!",
      })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({
        id: 6,
        message: "Hey~ Wishing you all the best today!",
      })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({ id: 7, message: "Hey~ Enjoy every moment of today!" })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({
        id: 8,
        message: "Hey~ Smile and have a wonderful day!",
      })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({ id: 9, message: "Hey~ Make today amazing!" })
    ),
    redis.rpush(
      "greets:list",
      JSON.stringify({
        id: 10,
        message: "Hey~ Stay positive and keep shining!",
      })
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

function validatePagination(offset, limit, totalGreets) {
  if (isNaN(offset) || offset < 0 || !Number.isInteger(offset)) {
    return {
      error: "Invalid offset value. It must be a non-negative integer.",
    };
  }
  if (isNaN(limit) || limit < 1 || !Number.isInteger(limit)) {
    return {
      error:
        "Invalid limit value. It must be a positive integer greater than 0.",
    };
  }
  if (offset >= totalGreets || offset + limit > totalGreets) {
    return {
      error: `The requested offset and limit exceed the total number of greets. Available offsets: 0 - ${
        totalGreets - 1
      }.`,
    };
  }
  return null;
}

app.get("/greets", async (req, res) => {
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  const limit = req.query.limit ? Number(req.query.limit) : 2;

  const totalGreets = await redis.llen("greets:list");

  const validationError = validatePagination(offset, limit, totalGreets);

  if (validationError) {
    return res.status(400).json(validationError);
  }

  const greetsList = await redis.lrange(
    "greets:list",
    offset,
    offset + limit - 1
  );
  const greets = greetsList.map((greet) => JSON.parse(greet));

  res.status(200).send(greets);
});

app.get("/greets/all", async (req, res) => {
  try {
    const keys = await redis.keys("greets:[0-9]*");
    const greets = await redis.mget(keys);
    const parsedGreets = greets.map((greet) => JSON.parse(greet));
    parsedGreets.sort((a, b) => a.id - b.id);
    res.status(200).send(parsedGreets);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }
});

app.get("/greets/all/stream", async (req, res) => {
  try {
    const stream = redis.scanStream({
      match: "greets:[0-9]*",
      count: 2,
    });

    const greets = [];
    for await (const resultKeys of stream) {
      for (const key of resultKeys) {
        const value = await redis.get(key);
        const greet = JSON.parse(value);
        greets.push(greet);
      }
    }
    greets.sort((a, b) => a.id - b.id);
    res.status(200).send(greets);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal error");
  }
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
