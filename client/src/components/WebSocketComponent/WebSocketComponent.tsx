import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Socket } from "socket.io-client";
import { RootState } from "../../store";
import {
  thunkGetChannelMessages,
  thunkOnChatMessage,
} from "../../thunk-middlewares";

/**
 * This checks WebSocket connectivity in every 1 second, then stops when connected.
 */
const checkWSConnectivity = (socket: Socket, maxCount = 10) => {
  let count = 0;
  const timeout = setInterval(() => {
    console.log("connecting to WebSocket server... count:", count);
    socket.connect();
    if (socket.connected) {
      // stop connectivity check
      console.log("WebScoket connected!");
      clearTimeout(timeout);
    }
    if (count >= maxCount) {
      console.warn("WebSocket connection timed out");
      clearTimeout(timeout);
    }
    count++;
  }, 3000);
};

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
    // check WebScoket connectivity
    checkWSConnectivity(socket);

    // on chat message
    socket.on("chat message", (data) => {
      onChatMessage(data);
    });

    // on disconnect event
    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected - reason: ", reason);
      console.log("Retrying connection to server...");
      checkWSConnectivity(socket);
    });

    // on joined a new room
    socket.on("joined a new room", (data) => {
      // validate channel ID
      const channelId = data?.channelId;
      // add channel to the list
      if (channelId && typeof channelId === "string") {
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
      socket.disconnect();
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
