import { LeftColumn } from "../LeftColumn/LeftColumn";
import { RightColumn } from "../RightColumn/RightColumn";
// import { GetChannelsComponent } from "../GetChannelsComponent/GetChannelsComponent";
import { WebSocketComponent } from "../../components/Common/WebSocketComponent/WebSocketComponent";
import { socket } from "../../utils/socket";

import "./MainContainer.css";

export const MainContainer = () => (
  <div className="main">
    <LeftColumn />
    <RightColumn />
    {/* <GetChannelsComponent /> */}
    <WebSocketComponent socket={socket} />
  </div>
);
