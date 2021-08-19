import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";

import { validateMessage } from "./utils";

describe("validateChatPaylaod", () => {
  const getData = (): Message => ({
    id: uuid(),
    channelId: uuid(),
    sender: { id: uuid(), name: nanoid() },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    content: nanoid(),
  });

  it("should return ChatPayload", () => {
    expect.assertions(1);
    const data = getData();
    expect(validateMessage(data)).toEqual(true);
  });

  it("should validate input", () => {
    expect.assertions(8);
    // sender
    let data = getData();
    data.sender = undefined as any;
    expect(validateMessage(data)).toEqual(false);
    // sender.id
    data = getData();
    data.sender.id = "xxx";
    expect(validateMessage(data)).toEqual(false);
    // sender.name
    data = getData();
    data.sender.name = 123 as any;
    expect(validateMessage(data)).toEqual(false);
    // createdAt
    expect(validateMessage({ ...getData(), createdAt: "xxx" } as any)).toEqual(
      false
    );
    // updatedAt
    expect(validateMessage({ ...getData(), updatedAt: "xxx" } as any)).toEqual(
      false
    );
    // channelId
    expect(validateMessage({ ...getData(), channelId: "xxx" })).toEqual(false);
    // messageId
    expect(validateMessage({ ...getData(), id: "xxx" })).toEqual(false);
    // content
    expect(validateMessage({ ...getData(), content: 123 } as any)).toEqual(
      false
    );
  });
});
