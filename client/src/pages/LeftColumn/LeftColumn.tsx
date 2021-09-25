import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import {
  thunkGetChannelMessages,
  thunkGetMyChannels,
  thunkShowNewChannelModal,
} from "../../utils/thunk-middlewares";

import { RootState } from "../../utils/store";
import { ChannelList } from "../../components/Channel/ChannelItem/ChannelList";
import { Button } from "../../components/Common/Button/Button";
import { LoadingSpinner2 } from "../../components/Common/LoadingSpinner2/LoadingSpinner2";

import "./LeftColumn.css";

const _LeftColumn = ({
  channels,
  highlighted,
  loading,
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
      {loading ? (
        <div className="leftcolumn-nochannel">
          <LoadingSpinner2 />
        </div>
      ) : channels.length === 0 ? (
        <div className="leftcolumn-nochannel">
          <span>You don't have any channels yet.</span>
        </div>
      ) : (
        <ChannelList
          channels={channels}
          highlighted={highlighted}
          getMessages={getMessages}
        />
      )}
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
  loading: state.channel.loading,
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
