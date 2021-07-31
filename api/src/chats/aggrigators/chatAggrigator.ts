import { KafkaMessage } from "kafkajs";
import { Queries } from "../queries/query";

export interface ChatAggrigator {
  process: (message: KafkaMessage) => Promise<void>;
  createMessage: (event: MessageCreatedEvent) => Promise<void>;
  deleteMessage: (event: MessageDeletedEvent) => Promise<void>;
  updateMessage: (evnet: MessageUpdatedEvent) => Promise<void>;
  createChannel: (event: ChannelCreatedEvent) => Promise<void>;
  updateChannel: (event: ChannelUpdatedEvent) => Promise<void>;
  deleteChannel: (event: ChannelDeletedEvent) => Promise<void>;
  addUserToChannel: (event: UsersJoinedEvent) => Promise<void>;
  removeUserFromChannel: (event: UsersRemovedEvent) => Promise<void>;
}

export const getChatAggrigator = (queries: Queries): ChatAggrigator => {
  const { channelQuery, messageQuery, rosterQuery } = queries;
  return {
    async process(message: KafkaMessage) {
      // if msg.value is empty, raise an error
      if (!message.value) throw new Error("message.value is empty");
      // parse message
      const event = JSON.parse(message.value.toString()) as EventTypes;

      // console.log(`TYPE: ${event.type}`);
      try {
        // check event type
        switch (event.type) {
          case "MessageCreated":
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

    async createMessage(event: MessageCreatedEvent) {
      const { messageId, channelId, sender, content } = event.payload;
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

    async deleteMessage(event: MessageDeletedEvent) {
      try {
        await messageQuery.deleteMessage(event.payload.messageId);
      } catch (e) {
        throw e;
      }
    },

    async updateMessage(event: MessageUpdatedEvent) {
      const { channelId, messageId, content } = event.payload;
      try {
        await messageQuery.editMessage(messageId, channelId, content);
      } catch (e) {
        throw e;
      }
    },

    async createChannel(event: ChannelCreatedEvent) {
      const { channelId, channelName, sender, memberIds } = event.payload;
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

    async updateChannel(event: ChannelUpdatedEvent) {
      const { channelId, newChannelName } = event.payload;
      try {
        // upcate the channel
        await channelQuery.updateChannelbyId(channelId, newChannelName);
      } catch (e) {
        throw e;
      }
    },

    async deleteChannel(event: ChannelDeletedEvent) {
      try {
        await channelQuery.deleteChannelById(event.payload.channelId);
      } catch (e) {
        throw e;
      }
    },

    async addUserToChannel(event: UsersJoinedEvent) {
      const { channelId, memberIds } = event.payload;
      try {
        // add user to channel
        await Promise.all(
          memberIds.map((id) => rosterQuery.addUserToChannel(channelId, id))
        );
      } catch (e) {
        throw e;
      }
    },

    async removeUserFromChannel(event: UsersRemovedEvent) {
      const { channelId, memberIds } = event.payload;
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
