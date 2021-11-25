import { convertTimestampToDate } from "../../../utils/utils";
import { LoadingSpinner2 } from "../../Common/LoadingSpinner2/LoadingSpinner2";

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
      {channel.messages ? (
        channel.messages.length > 0 ? (
          <div className="chat-pane">
            {channel.messages
              .sort((a, b) => a.createdAt - b.createdAt)
              .reverse()
              .map((msg) => (
                <MessageContainerItem
                  key={msg.id}
                  displayName={msg.sender.displayName}
                  timestamp={msg.createdAt}
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
        )
      ) : (
        <div
          className="chat-pane__spinner"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <LoadingSpinner2 />
        </div>
      )}
    </>
  );
};

export const MessageContainerItem = ({
  displayName,
  timestamp,
  content,
  isMyMessage,
  profilePhotoURL,
}: {
  displayName: string;
  timestamp: number;
  content: string;
  isMyMessage: boolean;
  profilePhotoURL?: string;
}) => {
  return (
    <div className={isMyMessage ? "message" : "message message_reverse"}>
      <div
        className={
          isMyMessage
            ? "message__container"
            : "message__container message__container_white"
        }
      >
        <img
          className="message__profile-image"
          src={profilePhotoURL}
          alt="profile"
        />
        <div className="message__name-and-content">
          <div className="message__name-container">
            <div className="message__name">{displayName}</div>
            <span className="message-timestamp">
              {convertTimestampToDate(timestamp)}
            </span>
          </div>
          <p className="message__content">{content}</p>
        </div>
      </div>
    </div>
  );
};
