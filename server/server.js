// Express app file

// (1) import express
// backend ==> require
const express = require('express');
var bodyParser = require('body-parser')

const Hangout = require('./models/Hangout')
// (2) import and enable cors
// (cross-origin resource sharing)
const cors = require('cors');

// (3) create an instanece of our express app
const webapp = express();
webapp.use(bodyParser.urlencoded({ extended: false }))
webapp.use(bodyParser.json())


// (4) enable cors
webapp.use(cors());

// (5) define the port
const port = 8080;

// (6) configure express to parse bodies
webapp.use(express.urlencoded({ extended: true }));

// (7) import the db interactions module
const dbLib = require('./dbFunctions');

// (8) declare a db reference variable
let db;

// start the server and connect to the DB
webapp.listen(port, async () => {
  db = await dbLib.connect();
  console.log(`Server running on port: ${port}`);
});
webapp.get('/hangouts/', async (req, res) => {
    console.log('READ all hangouts');
    try {
      // get the data from the db
      const results = await dbLib.getAllHangouts(db);
      // send the response with the appropriate status code
      res.status(200).json({ data: results });
    } catch (err) {
      res.status(404).json({ message: 'there was error' });
    }
  });
  webapp.post('/hangout/', async (req, res) => {
    console.log('CREATE a hangout');
    // parse the body of the request
   
    try {
      const newHangout = Hangout(req.body);
      const result = await dbLib.createHangout(db, newHangout);
      // send the response with the appropriate status code
      res.status(201).json({ data: { id: result } });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });