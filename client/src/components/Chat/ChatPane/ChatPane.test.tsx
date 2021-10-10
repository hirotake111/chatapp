import { render } from "@testing-library/react";
import { v4 as uuid } from "uuid";
import { getFakeChannel } from "../../../utils/testHelpers";

import { ChatPane, MessageContainerItem } from "./ChatPane";

describe("ChatPane", () => {
  it("should render messages", () => {
    expect.assertions(1);
    // create a new channel
    const channel = getFakeChannel();
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
  });

  it("should render 'start conversation' message if channel has no messages", () => {
    expect.assertions(1);
    // crete channel with no messages
    const channel: ChannelPayload = {
      ...getFakeChannel(),
      messages: [],
    };
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
});

describe("MessageContainerItem", () => {
  it("should render user's displayName, message", () => {
    expect.assertions(2);
    const { container } = render(
      <MessageContainerItem
        displayName="Test User"
        timestamp={Date.now()}
        content={"hello world"}
        isMyMessage={true}
      />
    );
    const message = container.getElementsByClassName("message")[0];
    expect(
      message.getElementsByClassName("message__name")[0].textContent
    ).toEqual("Test User");
    expect(
      message.getElementsByClassName("message__content")[0].textContent
    ).toEqual("hello world");
  });

  it("should render message as one from other if isMyMessage is false", () => {
    expect.assertions(1);
    const { container } = render(
      <MessageContainerItem
        displayName="Taro Suzuki"
        timestamp={Date.now()}
        content={"hey"}
        isMyMessage={false}
      />
    );
    const messages = container.getElementsByClassName("message_reverse");
    expect(messages.length).toEqual(1);
  });
});
