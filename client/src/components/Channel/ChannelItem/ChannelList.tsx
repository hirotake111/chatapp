import { MouseEventHandler } from "react";
import { getMemberSummary } from "../../../utils/utils";
import "./ChannelList.css";

export const ChannelList = ({
  channels,
  highlighted,
  getMessages,
}: {
  channels: ChannelPayload[];
  highlighted?: { id: string; name: string };
  getMessages: (channelId: string) => void;
}) => {
  // onClick handler
  const handleClick = async (channel: ChannelPayload) => {
    if (highlighted && channel.id !== highlighted.id) {
      // get messages in channel
      await getMessages(channel.id);
    }
  };
  return (
    <div className="channel-list">
      {channels.length ? (
        <ul>
          {channels
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((ch) => (
              <ChannelItem
                key={ch.id}
                title={ch.name}
                memberSummary={getMemberSummary(ch.name, ch.users)}
                isHighlighted={!!highlighted && highlighted.id === ch.id}
                onClick={async () => handleClick(ch)}
              />
            ))}
        </ul>
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", fontSize: "1.4rem" }}>
            You don't have any channels yet.
          </div>
        </div>
      )}
    </div>
  );
};

const ChannelItem = ({
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
