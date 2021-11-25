import { MouseEventHandler, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { useGetMessagesByChannelId } from "../../../hooks/messageHooks";
import { useGetMyChannels } from "../../../hooks/channelHooks";
import { updateNewChannelModalAction } from "../../../actions/newChannelActions";

import { ChannelList } from "../../Channel/ChannelItem/ChannelList";
import { Button } from "../../Common/Button/Button";
import { LoadingSpinner2 } from "../../Common/LoadingSpinner2/LoadingSpinner2";
import { ChannelSearchBar } from "../../Search/ChannelSearchBar/ChannelSearchBar";

import "./LeftColumn.css";

export const LeftColumn = () => {
  const dispatch = useAppDispatch();
  const { loading, highlighted } = useAppSelector((state) => state.channel);
  // custom hooks
  const getMessages = useGetMessagesByChannelId();
  const [channels, getMyChannels] = useGetMyChannels();

  // get channel list
  useEffect(() => {
    getMyChannels();
  }, []);

  const handleClick: MouseEventHandler = () => {
    // show new channel modal
    dispatch(updateNewChannelModalAction(true));
  };

  return (
    <div className="left-column">
      <ChannelSearchBar />
      {loading ? (
        <div className="leftcolumn-nochannel">
          <LoadingSpinner2 />
        </div>
      ) : channels.length === 0 ? (
        <div className="leftcolumn-nochannel">
          <span>You do not have any channels yet.</span>
        </div>
      ) : (
        <ChannelList
          channels={channels}
          highlighted={highlighted || "no channel is highlighted"}
          getMessages={getMessages}
        />
      )}
      <div className="new-channel-button-container">
        <Button enabled={true} onClick={handleClick}>
          NEW CHANNEL
        </Button>
      </div>
    </div>
  );
};
