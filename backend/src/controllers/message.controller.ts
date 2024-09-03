import mongoose, { ObjectId } from 'mongoose';
import express, {Request,Response} from 'express'
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

interface AuthenticatedRequest extends Request {
    userId?: string; 
}

export const sendMessage = async(req:AuthenticatedRequest,res:Response) : Promise<Response> =>{
    try {
        const senderId = req.userId ;
        const receiverId = req.params.id;

        // extract { textMessage: "Hello there!" } -> saved to message varable
        const {textMessage: message} = req.body;

        // finding if ther's any convertion between sender and reciever happened before
        let conversation = await Conversation.findOne({
            participants: { $all:[senderId,receiverId] },
        })

        // if not then create a new one
        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId,receiverId]
            })
        }

        // creating a new message document
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })

         // If message is created successfully, add it to the conversation's message array
        if(newMessage){
            conversation.messages.push(newMessage._id as any)
        }
        
        // Save both conversation and new message
        await Promise.all([conversation.save(), newMessage.save()]);

        // const receiverSocketId = getReceiverSocketId(receiverId);
        // if (receiverSocketId) {
        //     io.to(receiverSocketId).emit('newMessage', newMessage);
        // }

        return res.status(201).json({
            success: true,
            newMessage,
        });

    } catch (error: any) {
        console.error('Error sending message:', error.message);
        return res.status(500).json({ message: 'Server error', success: false });
    }
}

export const getMessage = async(req: AuthenticatedRequest, res:Response) : Promise<Response> =>{
    try {
        const senderId = req.userId;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        }).populate('messages'); // Populate the messages field with message details

        // If no conversation exists, return an empty array of messages
        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }   
        return res.status(200).json({ success: true, messages: conversation.messages });
    } catch (error: any) {
        console.error('Error getting messages:', error.message);
        return res.status(500).json({ message: 'Server error', success: false });
    }
};
