const Redis = require("ioredis");

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

module.exports = { redis, init };
