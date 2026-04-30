const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    sport_name: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      required: true
    },

    maxParticipants: {
      type: Number,
      required: true,
      min: 1
    },

    participants: {
      type: [String],
      default: []
    },

    createdBy: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["open", "full", "cancelled"],
      default: "open"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Session", sessionSchema);