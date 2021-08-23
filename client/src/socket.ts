import Client from "socket.io-client";

const url = process.env.REACT_APP_WS_URL;

const socket =
  url && url !== "dummyurl"
    ? Client(url, { autoConnect: false })
    : Client({ autoConnect: false });

console.log("registering onAny handler for debugging purpose");
socket.onAny((event, data) =>
  console.log("socket.onAny - event: ", event, " data: ", data)
);

socket.on("disconnect", (reason) => {
  console.log("WebSocket disconnected - reason: ", reason);
  console.log("Retrying connection to server...");
  socket.connect();
});

// socket.connect();
export { socket };
