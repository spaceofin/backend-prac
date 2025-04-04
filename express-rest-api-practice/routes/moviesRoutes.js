const router = require("express").Router();
const path = require("path");
const Movies = require(path.resolve("models", "moviesModel.js"));

router.route("/").get(async (req, res) => {
  const movies = await Movies.find();
  res.status(200).send(movies);
});

module.exports = router;
