const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./utils/data");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const temp = require("dotenv").config();
const port = process.env.PORT || 4000;
connection();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://talk-trail.vercel.app"],
    // origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);
const server = app.listen(port, console.log("Server connected to Harsh", port));
const io = require("socket.io")(server, {
  pingTimeout: 300000,
  cors: {
    origin: ["https://talk-trail.vercel.app"],
    // origin: ["http://localhost:3000"],
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room:", room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER Disconnected");
    socket.leave(userData._id);
  });
});
