const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); //cors = cross origin resource sharing

const app = express(); // app is an object that recieve and respond to any requests that coming and going back to react application
app.use(cors()); // cors allow us to make request from one domain that React app is running on to a compeltely different domain or port// express api host on
app.use(bodyParser.json());// bodyParser library parse incoming requests from React app and turned the body of the post request into a json that Express api can easily work with it

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on('connect', () => {
  pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));
});

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi');
}); // make test routes to make sure our app is working 

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');

  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!'); // we have not yet calculated for that index 
  redisPublisher.publish('insert', index); // gonna be the message that sent over to that worker process for calculation
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]); // add the new index that submitted to Postgress

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log('Listening');
});
