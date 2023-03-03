const mongoose = require('mongoose');
const { Schema } = mongoose;

const hangoutSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  organizer: {type: String, required: true},
  date: { type: Date, default: Date.now },
  contact: {type: String, required: true}
});
module.exports = mongoose.model('Hangout', hangoutSchema);
