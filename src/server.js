import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import { Server } from "socket.io";

// const color = require('color');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

//Routes files
import users from "./server/routes/auth.js";
import games from "./server/routes/game.js";

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Use this after the variable declaration

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parser
app.use(express.json());

//Mount routers
app.use("/api/v1/auth", users);
app.use("/api/v1/game", games);

const PORT = process.env.PORT || 7000;

//* SERVER */
const server = app.listen(
  PORT,
  console.log(
    `server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  //Close the server & exit process
  server.close(() => process.exit(1));
});

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     credentials: true, //access-control-allow-credentials:true
//     optionSuccessStatus: 200,
//   },
// });

// io.on("connection", (socket) => {
//   socket.on("Withdrawal_request", async (data) => {
//     const investment = await InvestmentModel.findById(data.id);
//     socket.broadcast.emit("Withdrawal_request", investment);
//   });
// });

// io.on("connection_failed", function () {
//   io.emit("connection_failed_handler", "Socket connection failed");
// });

// io.on("error", function () {
//   io.emit("error_handler", "Something went wrong with socket");
// });
