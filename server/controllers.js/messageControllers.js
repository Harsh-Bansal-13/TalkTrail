const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const { User } = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid request!!");
    return res.sendStatus(400);
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    // console.log("HARSH");
    var message = await Message.create(newMessage);
    message = await User.populate(message, {
      path: "sender",
      select: "name pic",
    });
    message = await Chat.populate(message, {
      path: "chat",
    });
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400);
    console.log(error);
    throw new Error(error.message);
  }
});

const allMessages = asyncHandler(async (req, res) => {
  try {
    var message = await Message.find({ chat: req.params.chatId });
    message = await User.populate(message, {
      path: "sender",
      select: "name pic email",
    });
    message = await Chat.populate(message, {
      path: "chat",
    });
    res.json(message);
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});
module.exports = { sendMessage, allMessages };
