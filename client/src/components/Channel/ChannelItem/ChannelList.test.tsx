import { it, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react";
import { v4 as uuid } from "uuid";
import { ChannelList } from "./ChannelList";

let callback: any;

const getChannel = (): ChannelPayload => {
  return {
    id: uuid(),
    name: "my channel",
    users: [
      { id: uuid(), displayName: "alice" },
      { id: uuid(), displayName: "bob" },
    ],
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

beforeEach(() => {
  callback = jest.fn();
});

it("should render channel items", () => {
  expect.assertions(1);
  const channels: ChannelPayload[] = [getChannel(), getChannel(), getChannel()];
  const { container } = render(
    <ChannelList channels={channels} getMessages={callback} />
  );
  const ulElement = container.firstChild?.firstChild as HTMLDivElement;
  if (!ulElement) throw new Error("failed to render ul element");
  expect(ulElement.childNodes.length).toEqual(3);
});

it("should render channel name in member list", () => {
  expect.assertions(1);
  const channels: ChannelPayload[] = [
    { ...getChannel(), users: [{ id: uuid(), displayName: "alice" }] },
  ];
  const { container } = render(
    <ChannelList channels={channels} getMessages={callback} />
  );
  expect(
    container.getElementsByClassName("channel-member-summary")[0].innerHTML
  ).toEqual("my channel");
});

it("should display number in member list", () => {
  expect.assertions(1);
  const channels: ChannelPayload[] = [
    {
      ...getChannel(),
      users: [
        { id: uuid(), displayName: "alice" },
        { id: uuid(), displayName: "bob" },
        { id: uuid(), displayName: "charlie" },
      ],
    },
  ];
  const { container } = render(
    <ChannelList channels={channels} getMessages={callback} />
  );
  expect(
    container.getElementsByClassName("channel-member-summary")[0].innerHTML
  ).toEqual("alice and bob + 1");
});

it("should invoke getMessages callback when clicked", () => {
  expect.assertions(1);
  const highlighted = { id: uuid(), name: "highlightedChannel" };
  const channels: ChannelPayload[] = [getChannel(), getChannel()];
  const { container } = render(
    <ChannelList
      highlighted={highlighted}
      channels={channels}
      getMessages={callback}
    />
  );
  fireEvent.click(container.getElementsByClassName("channel-list-title")[0]);
  expect(callback).toHaveBeenCalledTimes(1);
});

it("should not invoke getMessages callback when highlighted channel is no given", () => {
  expect.assertions(1);
  const channels: ChannelPayload[] = [getChannel(), getChannel()];
  const { container } = render(
    <ChannelList channels={channels} getMessages={callback} />
  );
  fireEvent.click(container.getElementsByClassName("channel-list-title")[0]);
  expect(callback).toHaveBeenCalledTimes(0);
});

it("should add channel-list-selected class when a channel is highlighted", () => {
  expect.assertions(1);
  const highlighted = getChannel();
  const channels: ChannelPayload[] = [getChannel(), highlighted, getChannel()];
  const { container } = render(
    <ChannelList
      channels={channels}
      highlighted={highlighted}
      getMessages={callback}
    />
  );
  expect(
    container.getElementsByClassName("channel-list-selected").length
  ).toEqual(1);
});
