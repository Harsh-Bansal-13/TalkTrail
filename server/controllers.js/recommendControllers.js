const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const { User } = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const recommendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { query, userId } = req.body;
  let messages = await Message.find({ chat: chatId });
  messages = await User.populate(messages, {
    path: "sender",
    select: "name pic email",
  });
  messages = await Chat.populate(messages, {
    path: "chat",
  });
  const context = messages
    .map((m) => {
      const senderLabel =
        m.sender._id.toString() === userId ? "You" : m.sender.name;
      return `${senderLabel}: ${m.content}`;
    })
    .join("\n");
  console.log(context);
  let prompt;

  if (!query) {
    prompt = `I am using as api for my chat application for automatically recommending users. This is a conversation:\n${context}\n\nBased on the conversation, suggest what you might say next. Respond naturally as the next message.Think In This Conversation You is you. Only Give me Message`;
  } else {
    prompt = `I am using as api for my chat application for automatically recommending users.This is a conversation:\n${context}\n\n and you are currently typing: "${query}". Based on the context, continue the message intelligently.  Only Give me Message`;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY_GEMINI}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return res.json({ suggestion });
});
module.exports = { recommendMessage };
