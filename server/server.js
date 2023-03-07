// Express app file

// (1) import express
// backend ==> require
const express = require('express');
var bodyParser = require('body-parser')

const Hangout = require('./models/Hangout')
const User = require("./models/User")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
const auth = require("./middleware/auth");
const { ObjectId } = require('mongodb');
// start the server and connect to the DB
webapp.listen(port, async () => {
  db = await dbLib.connect();
  console.log(`Server running on port: ${port}`);
});
webapp.get('/hangouts/',  async (req, res) => {
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
  webapp.get('/myhangouts/:user_id', auth, async (req, res) => {
    console.log('READ my hangouts');
    try {
      // get the data from the db
      const user_id = req.params.user_id;
      const hangoutsIDs = await dbLib.getMyHangoutsID(db, user_id);
      const results = await dbLib.getMyHangouts(db, hangoutsIDs);
      // send the response with the appropriate status code
      res.status(200).json({ data: results });
    } catch (err) {
      res.status(404).json({ message: 'there was error' });
    }
  });
  webapp.post('/hangout/', auth, async (req, res) => {
    console.log('CREATE a hangout');
    // parse the body of the request
    try {
      const newHangout = Hangout(req.body);
      const result = await dbLib.createHangout(db, newHangout);
      result.favorites = [];
      const updateUser = await dbLib.addUserHangout(db, newHangout.user_id, result._id);
      // send the response with the appropriate status code
      res.status(201).json({ data: { id: result } });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }});

   webapp.delete('/hangout/:id/:userID', auth, async (req, res) => {
     console.log('DELETE a hangout');
     try {
       const id = req.params.id;
       const userID = req.params.userID
      const result = await dbLib.deleteHangout(db, id);
      const updateUser = await dbLib.findUserById(db, userID);
      console.log(`user: ${updateUser}`);
      updateUser.hangouts = updateUser.hangouts
          .filter((hangout=> hangout !== new ObjectId(id)));
      updateUser.favorites = updateUser.favorites
      .filter((hangout=> hangout !== new ObjectId(id)));
      res.status(201).json({ result });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }});
    webapp.patch('/likeHangout/:id/:userID', async (req, res) => {
      console.log('LIKE a hangout');
      try {
        const id = req.params.id;
        const userID = req.params.userID
        const hangout = await dbLib.likeHangout(db, id, userID);
        res.status(204).json({ hangout });
     } catch (err) {
       res.status(400).json({ message: err.message });
     }});
     webapp.patch('/unlikeHangout/:id/:userID', async (req, res) => {
      console.log('UNLIKE a hangout');
      try {
        const id = req.params.id;
        const userID = req.params.userID
        const hangout = await dbLib.unlikeHangout(db, id, userID);
        res.status(204).json({ hangout });
     } catch (err) {
       res.status(400).json({ message: err.message });
     }});
  webapp.post('/register/', async(req, res) => {
    try {
      const { name, email, password } = req.body;
      const oldUser = await dbLib.findUser(db, email);
      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }
      const encryptedPW = await bcrypt.hash(password, 10);
      const userObj = User( {name: name,
        email: email.toLowerCase(),
        password: encryptedPW,
        favorites: [],
        hangouts: []});
      const user = await dbLib.createUser(db, userObj);
      console.log(user);
      const token = jwt.sign(
        { user_id: user, name: userObj.name },
        process.env.secret,
        {
          expiresIn: "2h",
        }
      );
      user.token = token;
      // return new user
      res.status(201).json({token});
  } catch (err) {
    console.log(`error: ${err}`);
  }
})

  webapp.post("/login", async(req, res) => {
    try {
    const { email, password } = req.body;
    const user = await dbLib.findUser(db, email);
    console.log(user);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id,  name: user.name },
        process.env.secret,
        {
          expiresIn: "2h",
        }
      );
    user.token = token;
    res.status(200).json(user);
  }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
  })