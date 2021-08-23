import { LeftColumn } from "../LeftColumn/LeftColumn";
import { RightColumn } from "../RightColumn/RightColumn";
// import { GetChannelsComponent } from "../GetChannelsComponent/GetChannelsComponent";
import { WebSocketComponent } from "../../components/WebSocketComponent/WebSocketComponent";
import { socket } from "../../socket";

import "./MainContainer.css";

export const MainContainer = () => (
  <div className="main">
    <LeftColumn />
    <RightColumn />
    {/* <GetChannelsComponent /> */}
    <WebSocketComponent socket={socket} />
  </div>
);
