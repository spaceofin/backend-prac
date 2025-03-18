const router = require("express").Router();

const errorOccurMiddleware = (req, res, next) => {
  console.log("error");
  next(new Error("Error Occurred"));
};

router.route("/error").get(errorOccurMiddleware, (req, res) => {
  res.status(200).send("This is error page");
});

router.route("/error-throw").get((req, res) => {
  throw new Error("Error Thrown");
});

router.route("/not-found").get((req, res, next) => {
  const error = new Error("Sometihne went wrong!");
  error.status = 404;
  next(error);
});

module.exports = router;
