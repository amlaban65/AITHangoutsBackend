
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
        console.log(`Hangouts: ${JSON.stringify(result)}`);
        return result;
    } catch (err) {
        console.log(err.message);
    }
}
const getMyHangoutsID = async(db, user_id) => {
  try {
      const result = await db.collection('Users').findOne({_id: new ObjectId(user_id)})
      console.log(user_id)
      console.log(JSON.stringify(result))
      return result.hangouts;
  } catch (err) {
      console.log(err.message);
  }
}
const getMyHangouts = async(db, hangoutsIDs) => {
  try {
    console.log(hangoutsIDs)
    const result = await db.collection('Hangouts').find({_id : {$in : hangoutsIDs}}).toArray();
    console.log(`my hangouts: ${JSON.stringify(result)}`)
    return result;
} catch (err) {
    console.log(err.message);
}
}
const likeHangout = async(db, id, userID) => {
  try {
    const result = await db.collection('Hangouts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $addToSet: { favorites: userID }
      }
   )
    return result;
} catch (err) {
    console.log(err.message);
} 
}
const unlikeHangout = async(db, id, userID) => {
  try {
    const result = await db.collection('Hangouts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $pull: { favorites: userID }
      }
   )
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
const addUserHangout = async (db, userID, newHangoutID) => {
  try {
    const result = await db.collection('Users')
    .updateOne({ _id: userID }, { $push: { hangouts: new ObjectId(newHangoutID)}}); 
    return result.insertedId;
} catch (err) {
    console.log(`error: ${err.message}`);
}
}
const findUser = async (db, email) => {
  try {
    const result = await db.collection('Users').findOne({email: email});
    console.log(JSON.stringify(result));
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
  }
}
const createUser = async (db, user) => {
  try {
    const result = await db.collection('Users').insertOne(user);
    console.log(`new user: ${JSON.stringify(result)}`);
    return result.insertedId;
  } catch (err) {
    console.log(`error create user: ${err.message}`);
}
}
const findUserById = async (db, userID) => {
try {
  const user = await db.collection('Users').findOne({_id: new ObjectId(userID)});
  return user;
} catch (err) {
  console.log(`error find user by id: ${err.message}`);
}
}
const deleteHangout = async (db, id) => {
  try {
  const hangout = await db.collection('Hangouts').deleteOne({_id: new ObjectId(id)});
  const deleteFromFavs = await db.collection('Users').updateMany({})
  return hangout;
  } catch (err) {
    console.log(`error delete hangout by id: ${err.message}`);
  }
}
module.exports = {
    connect, getAllHangouts, createHangout, findUser,
     createUser, addUserHangout, getMyHangoutsID, getMyHangouts,
     deleteHangout, findUserById, unlikeHangout, likeHangout

}