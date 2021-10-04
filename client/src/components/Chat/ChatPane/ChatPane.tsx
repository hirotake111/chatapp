import { convertTimestampToDate } from "../../../utils/utils";

import "./ChatPane.css";

export const ChatPane = ({
  channel,
  senderId,
}: {
  channel: ChannelPayload;
  senderId: string;
}) => {
  return (
    <>
      {channel.messages && channel.messages.length > 0 ? (
        <div className="chat-pane">
          {channel.messages
            .slice()
            .reverse()
            .map((msg) => (
              <MessageContainerItem
                key={msg.id}
                timestamp={msg.updatedAt}
                content={msg.content}
                isMyMessage={msg.sender.id === senderId}
              />
            ))}
        </div>
      ) : (
        <div className="chat-pane-withNoMessage">
          <span>You can start your new conversation here!!</span>
        </div>
      )}
    </>
  );
};

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
