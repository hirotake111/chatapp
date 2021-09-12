import { connect, ConnectedProps } from "react-redux";
import {
  thunkGetChannelMessages,
  thunkGetMyChannels,
  thunkShowNewChannelModal,
} from "../../utils/thunk-middlewares";

import { RootState } from "../../utils/store";
import { ChannelList } from "../../components/Channel/ChannelItem/ChannelList";
import { Button } from "../../components/Common/Button/Button";

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
      <ChannelList
        channels={channels}
        highlighted={highlighted}
        getMessages={getMessages}
      />
      <div className="new-channel-button-container">
        <Button
          enabled={true}
          value="NEW CHANNEL"
          onClick={handleNewChannelButtonClick}
        />
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
