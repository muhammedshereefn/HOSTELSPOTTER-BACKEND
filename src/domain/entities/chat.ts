

import mongoose, { Document, Schema } from 'mongoose';

export interface Message {
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface ChatDocument extends Document {
  userId: string;
  vendorId: string;
  messages: Message[];
}

const messageSchema: Schema<Message> = new Schema({
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema: Schema<ChatDocument> = new Schema({
  userId: { type: String, required: true },
  vendorId: { type: String, required: true },
  messages: { type: [messageSchema], default: [] },
});

export const ChatModel = mongoose.model<ChatDocument>('Chat', chatSchema);
