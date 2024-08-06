import { Request, Response } from 'express';
import { ChatModel } from '../../domain/entities/chat';
import { UserModel } from '../../infrastructure/database/models/UserModel';
import { ObjectId } from 'mongoose';


export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { userId, vendorId, text,senderId } = req.body;

    const chat = await ChatModel.findOne({ userId, vendorId });

    if (!chat) {
      const newChat = new ChatModel({
        userId,
        vendorId,
        messages: [{ senderId, text, timestamp: new Date() }],
      });
      await newChat.save();
    } else {
      chat.messages.push({ senderId, text, timestamp: new Date() });
      await chat.save();
    }

    res.status(200).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const fetchChats = async (req: Request, res: Response) => {
  try {
    const { userId, vendorId } = req.params;

    const chat = await ChatModel.findOne({ userId, vendorId });

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
  
};

export const fetchVendorChats = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const chats = await ChatModel.find({ vendorId }).lean(); 

    // Fetch user details for each chat
    const userIds = chats.map(chat => chat.userId);
    const users = await UserModel.find({ _id: { $in: userIds } }, 'name'); 

    const userMap = users.reduce((acc: Record<string, string>, user) => {
      acc[user._id.toString()] = user.name;
      return acc;
    }, {});

    const chatsWithUserNames = chats.map(chat => ({
      ...chat,
      userName: userMap[chat.userId.toString()] || 'Unknown User',  // Include user name or default to 'Unknown User'
    }));

    res.status(200).json(chatsWithUserNames);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendor chats' });
  }
};