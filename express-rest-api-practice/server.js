const express = require("express");
const app = express();
const path = require("path");
const { redis, init } = require(path.resolve("config", "redis.js"));
const router = express.Router();

app.set("view engine", "ejs");
app.use(express.static("public"));
// app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/", require(path.resolve("routes", "greetRoutes.js")));
app.use("/", require(path.resolve("routes", "ioRoutes.js")));
app.use("/", require(path.resolve("routes", "errorRoutes.js")));

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

app.use(router);
