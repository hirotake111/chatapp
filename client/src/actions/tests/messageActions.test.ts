import { getFakeMessage } from "../../utils/testHelpers";
import * as actions from "../messageActions";

describe("SendMessageAction", () => {
  it("should return SemMessageActionType", () => {
    expect.assertions(1);
    const message = getFakeMessage();
    const result = actions.SendMessageAction(message);
    expect(result).toEqual({
      type: "message/sendMessage",
      payload: message,
    });
  });
});
