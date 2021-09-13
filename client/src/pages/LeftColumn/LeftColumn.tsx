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
