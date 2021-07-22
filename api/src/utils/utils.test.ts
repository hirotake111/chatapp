import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";

import { validateChatPayload } from "./utils";

describe("validateChatPaylaod", () => {
  const getData = (): ChatPayload => ({
    channelId: uuid(),
    messageId: uuid(),
    sender: { id: uuid(), name: nanoid() },
    timestamp: Date.now(),
    content: nanoid(),
  });

  it("should return ChatPayload", () => {
    expect.assertions(1);
    const data = getData();
    expect(validateChatPayload(data)).toEqual(data);
  });

  it("should validate input", () => {
    expect.assertions(7);
    // sender
    let data = getData();
    data.sender = undefined as any;
    expect(validateChatPayload(data)).toEqual(null);
    // sender.id
    data = getData();
    data.sender.id = "xxx";
    expect(validateChatPayload(data)).toEqual(null);
    // sender.name
    data = getData();
    data.sender.name = 123 as any;
    expect(validateChatPayload(data)).toEqual(null);
    // timestamp
    expect(validateChatPayload({ ...getData(), timestamp: "xxx" })).toEqual(
      null
    );
    // channelId
    expect(validateChatPayload({ ...getData(), channelId: "xxx" })).toEqual(
      null
    );
    // messageId
    expect(validateChatPayload({ ...getData(), messageId: "xxx" })).toEqual(
      null
    );
    // content
    expect(validateChatPayload({ ...getData(), content: 123 })).toEqual(null);
  });
});
