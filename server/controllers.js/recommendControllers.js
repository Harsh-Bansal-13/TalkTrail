const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const { User } = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
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
        m.sender._id.toString() === userId ? "Gemini" : m.sender.name;
      return `${senderLabel}: ${m.content}`;
    })
    .join("\n");
  let prompt;

  if (!query) {
    prompt = `
You are an AI assistant acting as a participant in a real chat conversation.
In this conversation, **you are "Gemini"**.

Conversation so far:
${context}

Task:
- Suggest the **next natural message** that Gemini would send.
- The response should sound human, casual, and context-aware.
- Do NOT explain your reasoning.
- Do NOT add extra formatting.
- Do NOT mention that you are an AI or an assistant.

Output:
- Return ONLY the exact message Gemini would send next.
`;
  }
  else {
    prompt = `
You are an AI assistant acting as a participant in a real chat conversation.
In this conversation, **you are "Gemini"**.

Conversation so far:
${context}

Gemini has started typing:
"${query}"

Task:
- Intelligently **continue and complete** the message Gemini is typing.
- Match the tone, intent, and style of the conversation.
- Keep it natural and concise.
- Do NOT repeat the already typed text.
- Do NOT explain your reasoning.
- Do NOT add extra formatting.

Output:
- Return ONLY the continuation of the message.
`;
  }





  const chatCompletion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const summary = chatCompletion.choices[0]?.message?.content || "";
  console.log("121212",response, "1212121")

  return res.json({ summary });
});
const generateSummary = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
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
      const senderLabel = m.sender.name;
      return `${senderLabel}: ${m.content}`;
    })
    .join("\n");
  const prompt = `Summarize the following chat conversation in a concise paragraph:\n\n${context} Give me only summary`;

  const chatCompletion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  const summary = chatCompletion.choices[0]?.message?.content || "";

  return res.json({ summary });
});
module.exports = { recommendMessage, generateSummary };


// const asyncHandler = require("express-async-handler");
// const Message = require("../Models/messageModel");
// const { User } = require("../Models/userModel");
// const Chat = require("../Models/chatModel");
// const recommendMessage = asyncHandler(async (req, res) => {
//   const { chatId } = req.params;
//   const { query, userId } = req.body;
//   let messages = await Message.find({ chat: chatId });
//   messages = await User.populate(messages, {
//     path: "sender",
//     select: "name pic email",
//   });
//   messages = await Chat.populate(messages, {
//     path: "chat",
//   });
//   const context = messages
//     .map((m) => {
//       const senderLabel =
//         m.sender._id.toString() === userId ? "Gemini" : m.sender.name;
//       return `${senderLabel}: ${m.content}`;
//     })
//     .join("\n");
//   let prompt;

//   if (!query) {
//     prompt = `I am using you as api for my chat application for automatically recommending users. This is a conversation:\n${context}\n\nBased on the conversation, suggest what you might say next. Respond naturally as the next message.Think In This Conversation Gemini is you.what will you say Only Give me Message `;
//   } else {
//     prompt = `I am using you as api for my chat application for automatically recommending users, gemini is You in this conversation .This is a conversation:\n${context}\n\n and You are currently typing: "${query}". Based on the context, continue the message intelligently as you have been used as recommending.Only Give me Message`;
//   }

//   const response = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY_GEMINI}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//       }),
//     }
//   );

//   const data = await response.json();
//   const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//   return res.json({ suggestion });
// });
// const generateSummary = asyncHandler(async (req, res) => {
//   const { chatId } = req.params;
//   let messages = await Message.find({ chat: chatId });
//   messages = await User.populate(messages, {
//     path: "sender",
//     select: "name pic email",
//   });
//   messages = await Chat.populate(messages, {
//     path: "chat",
//   });
//   const context = messages
//     .map((m) => {
//       const senderLabel = m.sender.name;
//       return `${senderLabel}: ${m.content}`;
//     })
//     .join("\n");
//   const prompt = `Summarize the following chat conversation in a concise paragraph:\n\n${context} Give me only summary`;

//   const response = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.API_KEY_GEMINI}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//       }),
//     }
//   );

//   const data = await response.json();
//   const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

//   return res.json({ summary });
// });
// module.exports = { recommendMessage, generateSummary };