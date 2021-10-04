import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { thunkShowNewChannelModal } from "../../utils/thunk-middlewares";

import { ChannelList } from "../../components/Channel/ChannelItem/ChannelList";
import { Button } from "../../components/Common/Button/Button";
import { LoadingSpinner2 } from "../../components/Common/LoadingSpinner2/LoadingSpinner2";

import { RootState } from "../../utils/store";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useGetMessagesByChannelId } from "../../hooks/messageHooks";
import { useGetMyChannels } from "../../hooks/channelHooks";

import "./LeftColumn.css";

const _LeftColumn = ({ showNewChannelModal }: Props) => {
  const { loading, highlighted } = useAppSelector((state) => state.channel);

  const getMessages = useGetMessagesByChannelId();
  const [channels, getMyChannels] = useGetMyChannels();

  // get channel list
  useEffect(() => {
    getMyChannels();
  }, []);

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
          highlighted={highlighted || "no channel is highlighted"}
          getMessages={getMessages}
        />
      )}
      <div className="new-channel-button-container">
        <Button
          enabled={true}
          value="NEW CHANNEL"
          onClick={showNewChannelModal}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
  showNewChannelModal: thunkShowNewChannelModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const LeftColumn = connect(
  mapStateToProps,
  mapDispatchToProps
)(_LeftColumn);
