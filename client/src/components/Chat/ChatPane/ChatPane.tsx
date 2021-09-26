import { MessageContainerItem } from "../MessageContainer/MessageContainerItem";

import "./ChatPane.css";

export const ChatPane = ({
  highlighted,
  channels,
  senderId,
}: {
  highlighted: string;
  channels: ChannelPayload[];
  senderId: string;
}) => {
  const channel = channels.filter((ch) => ch.id === highlighted)[0];

  return (
    <div className="chat-pane">
      {channel && channel.messages
        ? channel.messages.map((msg) => (
            <MessageContainerItem
              key={msg.id}
              timestamp={msg.createdAt}
              content={msg.content}
              isMyMessage={msg.sender.id === senderId}
            />
          ))
        : "loading..."}
    </div>
  );
};
