import { convertTimestampToDate } from "../../utils/utils";
import "./MessageContainerItem.css";

export const MessageContainerItem = ({
  timestamp,
  content,
  isMyMessage,
}: {
  timestamp: number;
  content: string;
  isMyMessage: boolean;
}) => (
  <div className={"message-image-container" + (isMyMessage ? "" : " reverse")}>
    <div className={"message-container" + (isMyMessage ? "" : " white")}>
      <span className="message-timestamp">
        {convertTimestampToDate(timestamp)}
      </span>
      <p className="message">{content}</p>
    </div>
    <img
      className="profile-image"
      src={
        isMyMessage
          ? "https://randomuser.me/api/portraits/men/28.jpg"
          : "https://randomuser.me/api/portraits/women/3.jpg"
      }
      alt="profile"
    />
  </div>
);
