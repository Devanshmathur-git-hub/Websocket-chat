const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/chat-app")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schema
const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const savedMessage = await Message.create(data);

    // broadcast
    io.emit("receiveMessage", savedMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// start server
server.listen(5001, () => {
  console.log("Server running on port 5001");
});