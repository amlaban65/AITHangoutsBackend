
// import the mongodb driver
const { MongoClient } = require('mongodb');

// import ObjectID
const { ObjectId } = require('mongodb');

// the mongodb server URL
const dotenv = require('dotenv').config();
const dbURL = process.env.dbURL;
// connection to the db
const connect = async () => {
  // always use try/catch to handle any exception
  try {
    const con = (await MongoClient.connect(
      dbURL,
      { useNewUrlParser: true, useUnifiedTopology: true },
    )).db();
    // check that we are connected to the db
    console.log(`connected to db: ${con.databaseName}`);
    return con;
  } catch (err) {
    console.log(err.message);
  }
};
const getAllHangouts = async(db) => {
    try {
        const result = await db.collection('Hangouts').find({}).toArray();
        console.log(`Petitions: ${JSON.stringify(result)}`);
        return result;
    } catch (err) {
        console.log(err.message);
    }
}
const createHangout = async (db, newHangout) => {
    try {
        const result = await db.collection('Hangouts').insertOne(newHangout);
        return result.insertedId;
    } catch (err) {
        console.log(`error: ${err.message}`);
    }
}
module.exports = {
    connect, getAllHangouts, createHangout
  };