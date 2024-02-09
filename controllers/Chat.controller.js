"use strict";
const mongoose = require("mongoose");
const { catchAsync } = require("../utils/catchAsync");
const Chat = mongoose.model("Chat");
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});
exports.getAllChats = catchAsync(async (req, res) => {
  const chats = await Chat.find({ user: req.decoded.usr });
  res.status(200).json(chats);
});

// Función modificada para obtener respuesta del modelo entrenado
const getResponseFromBot = async (messages, model) => {
  try {
    const chatmessages = [{
      "role": "system",
      "content": "Eres un chatbot médico llamado Healthassist que opera exclusivamente en español, enfocado en temas únicamente de salud, eres un experto en medicina."
    }]
    const chatCompletion = await openai.chat.completions.create({
      messages: chatmessages.concat(messages.map((message) => ({ role: message.user ? "user" : "assistant", content: message.message }))),
      model: 'ft:gpt-3.5-turbo-1106:personal::8iHifpYA',
    });
    console.log(chatmessages.concat(messages.map((message) => ({ role: message.user ? "user" : "assistant", content: message.message }))))
    return chatCompletion.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error al obtener respuesta de OpenAI:', error);
    return "Hubo un error al obtener la respuesta.";
  }
};

exports.createChat = catchAsync(async (req, res) => {
  const response = await getResponseFromBot(req.body.messages, req.body.model);
  const messages = [
    ...req.body.messages,
    { message: response, model: req.body.model || "GPT" },
  ];
  const newChat = await Chat.create({ ...req.body, messages });
  res.status(201).json(newChat);
});

exports.updateChat = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (req.body.messages) {
    const response = await getResponseFromBot(req.body.messages, req.body.model);
    req.body.messages = [
      ...req.body.messages,
      { message: response, model: req.body.model || "GPT" },
    ];
  }

  const chat = await Chat.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!chat) {
    return res.status(404).json();
  }

  return res.status(200).json(chat);
});

exports.deleteChats = catchAsync(async (req, res) => {
  const ids = req.body;
  const query = await Chat.deleteMany({
    _id: { $in: ids },
  });

  if (query.deletedCount > 0) {
    res.status(204).json(1);
    return;
  }

  res.status(500).json("Not found");
});
