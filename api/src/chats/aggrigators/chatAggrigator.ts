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

      // console.log(`TYPE: ${event.type}`);
      try {
        // check event type
        switch (event.type) {
          case "MessageAdded":
            await this.createMessage(event);
            break;
          case "MessageDeleted":
            await this.deleteMessage(event);
            break;
          case "MessageUpdated":
            await this.updateMessage(event);
            break;
          case "ChannelCreated":
            await this.createChannel(event);
            break;
          case "ChannelDeleted":
            await this.deleteChannel(event);
            break;
          case "ChannelUpdated":
            await this.updateChannel(event);
            break;
          case "UsersJoined":
            await this.addUserToChannel(event);
            break;
          case "UsersRemoved":
            await this.removeUserFromChannel(event);
            break;
          default:
            break;
        }
      } catch (e) {
        throw e;
      }
    },

    async createMessage(event: ChatEvent) {
      if (!event.data.addMessage) {
        throw new Error(`Invalid event data: ${event.data}`);
      }
      const { messageId, channelId, sender, content } = event.data.addMessage;
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

    async deleteMessage(event: ChatEvent) {
      if (!event.data.deleteMessage)
        throw new Error(`Invalid event data: ${event.data}`);
      try {
        await messageQuery.deleteMessage(event.data.deleteMessage.messageId);
      } catch (e) {
        throw e;
      }
    },

    async updateMessage(event: ChatEvent) {
      if (!event.data.updateMessage)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, messageId, content } = event.data.updateMessage;
      try {
        await messageQuery.editMessage(messageId, channelId, content);
      } catch (e) {
        throw e;
      }
    },

    async createChannel(event: ChatEvent) {
      if (!event.data.createChannel)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, channelName, sender, memberIds } =
        event.data.createChannel;
      try {
        // create a new channel
        const channel = await channelQuery.createChannel(
          channelId,
          channelName
        );
        if (!channel) throw new Error("Failed to store a channel to database");
        // add requester to channel
        const roster = await rosterQuery.addUserToChannel(
          channel.id,
          sender.id
        );
        if (!roster)
          throw new Error(
            `Failed to add requester ${sender.id} to channel ${channelId}`
          );
        // add other members to the channel
        if (memberIds.length > 0)
          await Promise.all(
            memberIds.map((id) => rosterQuery.addUserToChannel(channel.id, id))
          );
      } catch (e) {
        throw e;
      }
    },

    async updateChannel(event: ChatEvent) {
      if (!event.data.updateChannel)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, newChannelName } = event.data.updateChannel;
      try {
        // upcate the channel
        await channelQuery.updateChannelbyId(channelId, newChannelName);
      } catch (e) {
        throw e;
      }
    },

    async deleteChannel(event: ChatEvent) {
      if (!event.data.deleteChannel)
        throw new Error(`Invalid event data: ${event.data}`);
      try {
        await channelQuery.deleteChannelById(
          event.data.deleteChannel.channelId
        );
      } catch (e) {
        throw e;
      }
    },

    async addUserToChannel(event: ChatEvent) {
      if (!event.data.addUsersToChannel)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, memberIds } = event.data.addUsersToChannel;
      try {
        // add user to channel
        await Promise.all(
          memberIds.map((id) => rosterQuery.addUserToChannel(channelId, id))
        );
      } catch (e) {
        throw e;
      }
    },

    async removeUserFromChannel(event: ChatEvent) {
      if (!event.data.removeUsersFromChannel)
        throw new Error(`Invalid event data: ${event.data}`);
      const { channelId, memberIds } = event.data.removeUsersFromChannel;
      try {
        // remove user from channel
        await Promise.all(
          memberIds.map((id) =>
            rosterQuery.deleteUserFromChannel(channelId, id)
          )
        );
      } catch (e) {
        throw e;
      }
    },
  };
};
