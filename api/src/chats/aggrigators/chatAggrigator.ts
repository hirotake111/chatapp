import { KafkaMessage } from "kafkajs";
import { Queries } from "../queries/query";

export const getChatAggrigator = (queries: Queries) => {
  const { channelQuery, messageQuery, rosterQuery } = queries;
  return {
    async process(message: KafkaMessage) {
      // if msg.value is empty, raise an error
      if (!message.value) throw new Error("message.value is empty");
      // parse message
      const event = JSON.parse(message.value.toString()) as ChatEvent;

      try {
        // check event type
        switch (event.type) {
          case "ChatCreated":
            this.createChat(event);
            break;
          case "ChatDeleted":
            this.deleteChat(event);
            break;
          case "ChannelCreated":
            this.createChannel(event);
            break;
          case "ChannelDeleted":
            this.deleteChannel(event);
            break;
          case "UserJoined":
            this.addUserToChannel(event);
          case "UserRemoved":
            this.removeUserFromChannel(event);
          default:
            break;
        }
      } catch (e) {
        throw e;
      }
    },

    async createChat(event: ChatEvent) {
      if (!event.data.message) {
        throw new Error(`Invalid event data: ${event.data}`);
      }
      const { messageId, channelId, sender, content } = event.data.message;
      try {
        const chat = await messageQuery.createMessage(
          messageId,
          channelId,
          sender.id,
          content
        );
        if (!chat) throw new Error("Failed to store a message to database");
      } catch (e) {
        throw e;
      }
    },

    async deleteChat(event: ChatEvent) {
      if (!event.data.message) {
        throw new Error(`Invalid event data: ${event.data}`);
      }
      try {
        await messageQuery.deleteMessage(event.data.message.messageId);
      } catch (e) {
        throw e;
      }
    },

    async createChannel(event: ChatEvent) {
      if (!event.data.channel)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, channelName, requesterId } = event.data.channel;
      try {
        const channel = await channelQuery.createChannel(
          channelId,
          channelName
        );
        if (!channel)
          throw new Error("Failed to create a new channel to database");
        // add requester to channel
        const roster = await rosterQuery.addUserToChannel(
          channelId,
          requesterId
        );
        if (!roster)
          throw new Error(
            `Failed to add requester ${requesterId} to channel ${channelId}`
          );
      } catch (e) {
        throw e;
      }
    },

    async deleteChannel(event: ChatEvent) {
      if (!event.data.channel)
        throw new Error(`Invalid event data: ${event.data}`);
      try {
        await channelQuery.deleteChannelById(event.data.channel.channelId);
      } catch (e) {
        throw e;
      }
    },

    async addUserToChannel(event: ChatEvent) {
      if (!event.data.roster)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, userId } = event.data.roster;
      try {
        // add user to channel
        const roster = await rosterQuery.addUserToChannel(channelId, userId);
        if (!roster)
          throw new Error(
            `Failed to add user ${userId} to channel ${channelId}`
          );
      } catch (e) {
        throw e;
      }
    },

    async removeUserFromChannel(event: ChatEvent) {
      if (!event.data.roster)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, userId } = event.data.roster;
      try {
        // remove user to channel
        await rosterQuery.deleteUserFromChannel(channelId, userId);
      } catch (e) {
        throw e;
      }
    },
  };
};
