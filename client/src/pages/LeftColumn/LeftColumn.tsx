import { connect, ConnectedProps } from "react-redux";
import {
  thunkGetChannelMessages,
  thunkGetMyChannels,
  thunkShowNewChannelModal,
} from "../../thunk-middlewares";

import { RootState } from "../../store";
import { ChannelItem } from "../../components/ChannelItem/ChannelItem";
import { Button } from "../../components/Button/Button";

import "./LeftColumn.css";
import { useEffect } from "react";

const getMemberSummary = (channel: ChannelPayload): string => {
  const { users, name } = channel;
  if (users.length < 2) {
    return name;
  }
  if (users.length === 2) {
    return `${users[0].displayName} and ${users[1].displayName}`;
  }
  return `${users[0].displayName} and ${users[1].displayName} + ${
    users.length - 2
  }`;
};

const _LeftColumn = ({
  channels,
  highlighted,
  getMessages,
  showNewChannelModal,
  getMychannels,
}: Props) => {
  // get channel list
  useEffect(() => {
    getMychannels();
  }, [getMychannels]);

  // onClick handler
  const handleClick = async (channel: ChannelPayload) => {
    if (highlighted && channel.id !== highlighted.id) {
      // get messages in channel
      await getMessages(channel.id);
    }
  };

  // onClick handler for new channel button
  const handleNewChannelButtonClick = () => {
    showNewChannelModal();
  };

  return (
    <div className="left-column">
      <div className="channel-list">
        {channels.length ? (
          <ul>
            {channels
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((ch) => (
                <ChannelItem
                  key={ch.id}
                  title={ch.name}
                  memberSummary={getMemberSummary(ch)}
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
      <div className="new-channel-button-container">
        <Button value="NEW CHANNEL" onClick={handleNewChannelButtonClick} />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  channels: state.channel.channels,
  highlighted: state.channel.highlighted,
});

const mapDispatchToProps = {
  getMessages: (channelId: string) => thunkGetChannelMessages(channelId),
  showNewChannelModal: thunkShowNewChannelModal,
  getMychannels: thunkGetMyChannels,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const LeftColumn = connect(
  mapStateToProps,
  mapDispatchToProps
)(_LeftColumn);
