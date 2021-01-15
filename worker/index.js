const keys = require('./keys'); //this file has the hostname and the port required for connectiong over to Redis
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000, // tell redis client that if it ever loses conncetion to our server, it automatically reconnect to the server
});
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

// watch Redis and get message any time that a new value shows up
sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
