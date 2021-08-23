import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Socket } from "socket.io-client";
import { RootState } from "../../store";
import { thunkOnChatMessage } from "../../thunk-middlewares";

const _WebSocketComponent = ({
  socket,
  onChatMessage,
}: Props & { socket: Socket }) => {
  useEffect(() => {
    socket.on("chat message", (data) => {
      onChatMessage(data);
    });
    console.log("connecting to WebSocket server...");
    socket.connect();
    console.log(socket.connected ? "connected!" : "failed...");
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
