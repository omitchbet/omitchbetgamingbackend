import mongoose from "mongoose";

var GameSchema = mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  identifier: {
    type: String,
    required: false,
  },
  provider: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  featureGroup: {
    type: String,
    required: false,
  },
});

const Game = mongoose.model("Game", GameSchema);
export default Game;
