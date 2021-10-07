import { connect, ConnectedProps } from "react-redux";

import {
  thunkChangeFormContent,
  thunkUpdateMemberModal,
} from "../../utils/thunk-middlewares";
import { RootState } from "../../utils/store";
import { ChatTextarea } from "../../components/Chat/ChatTextarea/ChatTextarea";
import { PaperPlaneIcon } from "../../components/Chat/PaperPlaneIcon/PaperPlaneIcon";
import { ChatPane } from "../../components/Chat/ChatPane/ChatPane";
import { Button } from "../../components/Common/Button/Button";

import "./RightColumn.css";
import { MouseEventHandler } from "react";
import { useSendMessage } from "../../hooks/messageHooks";
import { useAppSelector } from "../../hooks/reduxHooks";

const RColumn = ({ changeFormContent, updateMemberModal }: Props) => {
  const send = useSendMessage();
  const {
    user: { userInfo },
    channel: { highlighted, channels },
    message: { content },
  } = useAppSelector((state) => state);

  const highlightedChannel = channels.filter((ch) => ch.id === highlighted)[0];
  const handleChange = (data: string) => {
    // This avoids a new line without any words
    if (data !== "\n") changeFormContent(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if Enter + Shift key are pressed, then add a new line.
    // if Enter + any other keys are pressed, then send a message
    if (e.key === "Enter" && !e.shiftKey && content.length > 0) {
      send(content);
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
      {highlightedChannel && userInfo && userInfo.userId ? (
        <ChatPane channel={highlightedChannel} senderId={userInfo.userId} />
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
          <PaperPlaneIcon onClick={() => send(content)} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
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
