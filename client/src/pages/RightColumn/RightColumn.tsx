import { connect, ConnectedProps } from "react-redux";

import {
  thunkChangeFormContent,
  thunkGetChannelMessages,
  thunkUpdateMemberModal,
} from "../../utils/thunk-middlewares";
import { RootState } from "../../utils/store";
import { ChatTextarea } from "../../components/Chat/ChatTextarea/ChatTextarea";
import { PaperPlaneIcon } from "../../components/Chat/PaperPlaneIcon/PaperPlaneIcon";
import { ChatPane } from "../../components/Chat/ChatPane/ChatPane";
import { Button } from "../../components/Common/Button/Button";

import "./RightColumn.css";
import { MouseEventHandler, useEffect, useState } from "react";
import { useSendMessage } from "../../hooks/messageHooks";

const RColumn = ({
  highlighted,
  channels,
  sender,
  changeFormContent,
  updateMemberModal,
  content,
}: Props) => {
  const [highlightedChannel, setHighlightedChannel] =
    useState<ChannelPayload | null>(null);

  const send = useSendMessage();

  useEffect(() => {
    setHighlightedChannel(
      channels.length === 0
        ? null // display nothing if user joins no channels
        : highlighted
        ? // highlighted channel
          channels.filter((ch) => ch.id === highlighted)[0]
        : // otherwise, display the latest channel
          channels.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0]
    );
  }, [channels, highlighted]);

  const handleClickPaperPlane = (): void => {
    // check if user is authenticated
    if (!(sender && sender.userId && sender.username)) {
      console.log("prop sender is undefined - you are probably not signed in");
      return;
    }
    // if highlighted does not have any data, then do nothing
    if (!highlighted) {
      console.log("prop highlighted is undefined");
      return;
    }
    // send message to the server
    const message: MessageWithNoId = {
      channelId: highlighted,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sender: {
        id: sender.userId,
        username: sender.username,
        displayName: sender.displayName,
      },
    };
    send(message);
  };

  const handleChange = (data: string) => {
    // This avoids a new line without any words
    if (data !== "\n") changeFormContent(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if Enter + Shift key are pressed, then add a new line.
    // if Enter + any other keys are pressed, then send a message
    if (e.key === "Enter" && !e.shiftKey && content.length > 0) {
      handleClickPaperPlane();
      return;
    }
  };

  const handleClickAddMemberButton: MouseEventHandler = (e) => {
    updateMemberModal();
  };

  return (
    <div className="right-column">
      <div className="channel-title-container">
        <span className="channel-title">
          {highlightedChannel ? highlightedChannel.name : ""}
        </span>
        <div className="add-member-button-container">
          {!!highlighted ? (
            <Button
              value="ADD USERS"
              enabled={true}
              onClick={handleClickAddMemberButton}
            ></Button>
          ) : null}
        </div>
      </div>
      {highlightedChannel && sender && sender.userId ? (
        <ChatPane channel={highlightedChannel} senderId={sender.userId} />
      ) : (
        ""
      )}
      <div className="chat-form-container">
        <ChatTextarea
          content={content}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        <div className="chat-form-button-container">
          <PaperPlaneIcon onClick={() => handleClickPaperPlane()} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  highlighted: state.channel.highlighted,
  channels: state.channel.channels,
  sender: state.user.userInfo,
  content: state.message.content,
});

const mapDispatchToProps = {
  getChannelMessage: (channelId: string) => thunkGetChannelMessages(channelId),
  changeFormContent: (content: string) => thunkChangeFormContent(content),
  updateMemberModal: () => thunkUpdateMemberModal(true),
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const RightColumn = connect(
  mapStateToProps,
  mapDispatchToProps
)(RColumn);
