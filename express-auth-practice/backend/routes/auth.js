const express = require("express");
const router = express.Router();
const { generateToken } = require("../utils/tokenService");

const users = [
  { username: "testuser1", password: "1234" },
  { username: "testuser2", password: "2345" },
  { username: "testuser3", password: "3456" },
];

router
  .route("/login")
  .get((req, res) => {
    res.status(200).send("This is login route");
  })
  .post((req, res) => {
    const { username, password } = req.body;

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const token = generateToken({ username: user.username });
      return res.json({ token });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });

module.exports = router;
