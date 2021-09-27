import Client from "socket.io-client";

const url = process.env.REACT_APP_WS_URL;

const socket = url
  ? Client(url, { autoConnect: false })
  : Client({ autoConnect: false });

// console.log("registering onAny handler for debugging purpose");
socket.onAny((event, data) =>
  console.log("socket.onAny - event: ", event, " data: ", data)
);

// basic on disconnect event handler
socket.on("disconnect", (reason) => {
  console.log("WebSocket disconnected - reason: ", reason);
});

type Callback = (data: any) => void;

const registerWSEventHandlers = (callbacks: {
  [eventName: string]: Callback;
}) => {
  // connect websocket server
  socket.connect();
  // register each event handler
  Object.keys(callbacks).forEach((eventName) => {
    const callback = callbacks[eventName];
    console.log("registering callback event:", eventName);
    socket.on(eventName, (data) => {
      callback(data);
    });
  });
};

// socket.connect();
export { socket, registerWSEventHandlers };
