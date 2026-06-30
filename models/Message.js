const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sessionId: String,
  role: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", MessageSchema);