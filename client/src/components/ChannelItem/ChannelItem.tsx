import { MouseEventHandler } from "react";
import "./ChannelItem.css";

export const ChannelItem = ({
  title,
  memberSummary,
  isHighlighted,
  onClick,
}: {
  title: string;
  memberSummary: string;
  isHighlighted: boolean;
  onClick: MouseEventHandler<HTMLLIElement>;
}) => (
  <li onClick={onClick}>
    <div
      className={
        isHighlighted
          ? "channel-list-item-container channel-list-selected"
          : "channel-list-item-container"
      }
    >
      <div className="channel-list-title">{title}</div>
      <div className="channel-member-summary">{memberSummary}</div>
    </div>
  </li>
);
