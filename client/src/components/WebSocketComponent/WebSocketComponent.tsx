import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Socket } from "socket.io-client";
import { RootState } from "../../store";
import { thunkOnChatMessage } from "../../thunk-middlewares";

/**
 * This checks WebSocket connectivity in every 1 second, then stops when connected.
 */
const checkWSConnectivity = (socket: Socket, maxCount = 5) => {
  let count = 0;
  const timeout = setInterval(() => {
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
  }, 1000);
};

/**
 * This component binds redux and WebSocket, and render nothing
 */
const _WebSocketComponent = ({
  socket,
  onChatMessage,
}: Props & { socket: Socket }) => {
  // utilize userEffect hook to register WebSocket event handler
  useEffect(() => {
    console.log("connecting to WebSocket server...");
    socket.connect();
    // check WebScoket connectivity
    checkWSConnectivity(socket);

    // on chat message
    socket.on("chat message", (data) => {
      onChatMessage(data);
    });

    // on joined a new room
    socket.on("joined a new room", (data) => {
      console.warn("joined a new room with data:", data);
    });
    // cleanup function will close the connection
    return () => {
      console.log(
        "component is being unmounted - disconnect WebSocket from server"
      );
      socket.disconnect();
    };
  }, [socket, onChatMessage]);

  return null;
};

const mapStateToProps = (state: RootState) => ({
  // socket: state,
});
const mapDispatchToProps = {
  onChatMessage: (message: Message) => thunkOnChatMessage(message),
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const WebSocketComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(_WebSocketComponent);
