const path = require("path");
const express = require("express");
const app = express();
const fs = require("fs");
const { redis, init } = require("./config/redis.js");

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use("/static", express.static(path.join(__dirname, "public")));

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

app.get(
  "/",
  (req, res, next) => {
    console.log("This is express study");
    next();
  },
  (req, res) => {
    const greet = "hello world";
    res.render(path.join(__dirname, "views", "greet.ejs"), {
      title: "greeting",
      greet: greet,
    });
  }
);

const greetMiddleware = (req, res, next) => {
  console.log("This is greet route.");
  next();
};

app.get("/greet", greetMiddleware, (req, res) => {
  const greet = "Welcome!";
  res.render(path.join(__dirname, "views", "greet.ejs"), {
    title: "greeting",
    greet: greet,
  });
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

app.get("/greets/all", async (req, res) => {
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

app.get("/greet/:id", greetMiddleware, async (req, res) => {
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

app.get("/read-buffer", (req, res) => {
  fs.readFile(
    path.join(__dirname, "public", "dummy-buffer.txt"),
    (err, data) => {
      if (err) {
        res.status(500).send("File read error");
        return;
      }
      res.send(data.toString());
    }
  );
});

app.get("/read-stream", (req, res) => {
  const readStream = fs.createReadStream(
    path.join(__dirname, "public", "dummy-stream.txt"),
    { highWaterMark: 16 * 3 }
  );
  const writeStream = fs.createWriteStream(
    path.join(__dirname, "public", "write-stream.txt")
  );

  readStream.on("data", (chunk) => {
    console.log("__new chunk__");
    console.log(`${chunk}`);
    res.write(chunk);
    writeStream.write(chunk);
  });

  readStream.on("end", () => {
    console.log("finished");
    res.end();
  });

  readStream.on("error", (err) => {
    console.log(`error: ${err}`);
    res.status(500).send("File read error");
  });
});

app.get("/read-stream-pipe", (req, res) => {
  const readStream = fs.createReadStream(
    path.join(__dirname, "public", "dummy-stream.txt"),
    { highWaterMark: 16 * 3 }
  );
  const writeStream = fs.createWriteStream(
    path.join(__dirname, "public", "write-stream-pipe.txt")
  );

  readStream.pipe(writeStream);

  writeStream.on("finish", () => {
    res.status(200).send("Stream writing completed using pipe.");
  });
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
  const errorMessage = "Internal error";
  res.status(err.status || 500).render("error.ejs", {
    title: "error",
    message: errorMessage,
  });
});
