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
                profilePhotoURL={msg.sender.profilePhotoURL}
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
  profilePhotoURL,
}: {
  timestamp: number;
  content: string;
  isMyMessage: boolean;
  profilePhotoURL?: string;
}) => {
  return (
    <div
      className={"message-image-container" + (isMyMessage ? "" : " reverse")}
    >
      <div className={"message-container" + (isMyMessage ? "" : " white")}>
        <span className="message-timestamp">
          {convertTimestampToDate(timestamp)}
        </span>
        <p className="message">{content}</p>
      </div>
      <img className="profile-image" src={profilePhotoURL} alt="profile" />
    </div>
  );
};
