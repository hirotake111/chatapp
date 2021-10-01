import { render } from "@testing-library/react";
import { v4 as uuid } from "uuid";

import { ChatPane } from "./ChatPane";

/**
 * helper function to create message
 */
const getMesage = (channelId: string = uuid()): Message => {
  return {
    id: uuid(),
    channelId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sender: { id: uuid(), username: "BOB", displayName: "BOB" },
    content: `message in channel ${channelId}`,
  };
};

const getChannel = (name: string): ChannelPayload => {
  const id = uuid();
  return {
    id,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    users: [{ id: uuid(), displayName: "ALICE" }],
    messages: [getMesage(id), getMesage(id), getMesage(id)],
  };
};

it("should render messages", () => {
  expect.assertions(2);
  // create a new channel
  const channel = getChannel("my channel");
  // render chat pane
  const { container } = render(
    <ChatPane channel={channel} senderId={uuid()} />
  );
  // get messages
  const messages = container.getElementsByClassName("message");
  if (!(messages && messages.length > 0)) {
    throw new Error("failed to render ChatPane");
  }
  // validate the number of messages
  expect(messages.length).toEqual(3);
  expect(messages[0].textContent).toEqual(`message in channel ${channel.id}`);
});

it("should render 'start conversation' message if channel has no messages", () => {
  expect.assertions(1);
  // crete channel with no messages
  const channel: ChannelPayload = { ...getChannel("my channel"), messages: [] };
  // render it
  const { container } = render(
    <ChatPane channel={channel} senderId={uuid()} />
  );
  // get div element by class name "chat-pane-withNoMessage"
  const elm = container.getElementsByClassName("chat-pane-withNoMessage");
  expect(elm.item(0)?.textContent).toEqual(
    "You can start your new conversation here!!"
  );
});