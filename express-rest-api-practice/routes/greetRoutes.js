const router = require("express").Router();
const path = require("path");
const { redis } = require(path.resolve("config", "redis.js"));

const greetMiddleware = (req, res, next) => {
  console.log("This is greet route.");
  next();
};

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

router.route("/").get(
  (req, res, next) => {
    console.log("This is express study");
    next();
  },
  (req, res) => {
    const greet = "hello world";
    res.render(path.resolve("views", "greet.ejs"), {
      title: "greeting",
      greet: greet,
    });
  }
);

router.route("/greet").get(greetMiddleware, (req, res) => {
  const greet = "Welcome!";
  res.render(path.resolve("views", "greet.ejs"), {
    title: "greeting",
    greet: greet,
  });
});

router.route("/greets").get(async (req, res) => {
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  const limit = req.query.limit ? Number(req.query.limit) : 2;

  const totalGreets = await redis.llen("greets:list");

  const validationError = validatePagination(offset, limit, totalGreets);

  if (validationError) {
    console.log(validationError.error);
    return res.status(400).render("error.ejs", {
      title: "error",
      message: validationError.error,
    });
  }

  const greetsList = await redis.lrange(
    "greets:list",
    offset,
    offset + limit - 1
  );
  const greets = greetsList.map((greet) => JSON.parse(greet));

  res.render("greets-all.ejs", { title: "greetings", greets: greets });
});

router.route("/greets/all").get(async (req, res) => {
  try {
    const keys = await redis.keys("greets:[0-9]*");
    const greets = await redis.mget(keys);
    const parsedGreets = greets.map((greet) => JSON.parse(greet));
    parsedGreets.sort((a, b) => a.id - b.id);
    res.render("greets-all.ejs", {
      title: "all greetings",
      greets: parsedGreets,
    });
  } catch (err) {
    console.error(err);
    const errorMessage = "Internal error";
    res.status(500).render("error.ejs", {
      title: "error",
      message: errorMessage,
    });
  }
});

router.route("/greets/all/stream").get(async (req, res) => {
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
    res.render("greets-all.ejs", { title: "all greetings", greets: greets });
  } catch (err) {
    console.error(err);
    const errorMessage = "Internal error";
    res.status(500).render("error.ejs", {
      title: "error",
      message: errorMessage,
    });
  }
});

router.route("/greet/:id").get(greetMiddleware, async (req, res) => {
  try {
    const key = `greets:${req.params.id}`;
    const val = await redis.get(key);
    const greet = JSON.parse(val);
    res.render("greet.ejs", { title: "greeting", greet: greet });
  } catch (err) {
    console.error(err);
    const errorMessage = "Internal error";
    res.status(500).render("error.ejs", {
      title: "error",
      message: errorMessage,
    });
  }
});

module.exports = router;
