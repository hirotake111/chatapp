import Client from "socket.io-client";

const url = process.env.REACT_APP_WS_URL;

const socket =
  url && url !== "dummyurl"
    ? Client(url, { autoConnect: true })
    : Client({ autoConnect: true });

console.log("registering onAny handler for debugging purpose");
socket.onAny((event, data) =>
  console.log("socket.onAny - event: ", event, " data: ", data)
);

// socket.connect();
export { socket };
