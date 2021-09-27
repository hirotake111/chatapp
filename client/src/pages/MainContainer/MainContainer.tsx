import { LeftColumn } from "../LeftColumn/LeftColumn";
import { RightColumn } from "../RightColumn/RightColumn";

import "./MainContainer.css";

export const MainContainer = () => (
  <div className="main">
    <LeftColumn />
    <RightColumn />
  </div>
);
