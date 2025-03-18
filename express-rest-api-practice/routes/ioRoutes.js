const router = require("express").Router();
const fs = require("fs");
const path = require("path");

router.route("/read-buffer").get((req, res) => {
  fs.readFile(path.resolve("public", "dummy-buffer.txt"), (err, data) => {
    if (err) {
      res.status(500).send("File read error");
      return;
    }
    res.send(data.toString());
  });
});

router.route("/read-stream").get((req, res) => {
  const readStream = fs.createReadStream(
    path.resolve("public", "dummy-stream.txt"),
    { highWaterMark: 16 * 3 }
  );
  const writeStream = fs.createWriteStream(
    path.resolve("public", "write-stream.txt")
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

router.route("/read-stream-pipe").get((req, res) => {
  const readStream = fs.createReadStream(
    path.resolve("public", "dummy-stream.txt"),
    { highWaterMark: 16 * 3 }
  );
  const writeStream = fs.createWriteStream(
    path.resolve("public", "write-stream-pipe.txt")
  );

  readStream.pipe(writeStream);

  writeStream.on("finish", () => {
    res.status(200).send("Stream writing completed using pipe.");
  });
});

module.exports = router;
