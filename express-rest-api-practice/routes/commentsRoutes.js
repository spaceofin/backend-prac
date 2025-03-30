const router = require("express").Router();
const path = require("path");
const Comment = require(path.resolve("models", "commentsModel.js"));

console.log("comments routes");

router.route("/").get(async (req, res) => {
  const comments = await Comment.find();
  res.status(200).send(comments);
});

module.exports = router;
