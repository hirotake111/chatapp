import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Socket } from "socket.io-client";
import { validate } from "uuid";
import { RootState } from "../../../utils/store";
import {
  thunkGetChannelMessages,
  thunkOnChatMessage,
} from "../../../utils/thunk-middlewares";

/**
 * This component binds redux and WebSocket, and render nothing
 */
const _WebSocketComponent = ({
  socket,
  onChatMessage,
  onJoinNewChannel,
}: Props & { socket: Socket }) => {
  // utilize userEffect hook to register WebSocket event handler
  useEffect(() => {
    // on chat message
    socket.on("chat message", (data) => {
      onChatMessage(data);
    });

    // on disconnect event
    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected - reason: ", reason);
      // console.log("Retrying connection to server...");
      // checkWSConnectivity(socket);
    });

    // on joined a new room
    socket.on("joined a new room", (data) => {
      // validate channel ID
      const channelId = data?.channelId;
      // add channel to the list
      if (channelId && validate(channelId)) {
        onJoinNewChannel(channelId);
        return;
      }
      console.warn(`error - event name: "joined a new room", data: "${data}"`);
    });

    // cleanup function will close the connection
    return () => {
      console.log(
        "component is being unmounted - disconnect WebSocket from server"
      );
      // socket.disconnect();
    };
  }, [socket, onChatMessage, onJoinNewChannel]);

  return null;
};

const mapStateToProps = (state: RootState) => ({
  // socket: state,
});
const mapDispatchToProps = {
  onChatMessage: (message: Message) => thunkOnChatMessage(message),
  onJoinNewChannel: (channelId: string) => thunkGetChannelMessages(channelId),
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const WebSocketComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(_WebSocketComponent);
