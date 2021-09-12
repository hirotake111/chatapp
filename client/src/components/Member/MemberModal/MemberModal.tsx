import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../../utils/store";

import {
  thunkAddMemberToChannel,
  thunkUpdateMemberModal,
} from "../../../utils/thunk-middlewares";
import { CandidateListForMemberModal } from "../CandidateListForMemberModal/CandidateListForMemberModal";
import { Button } from "../../Common/Button/Button";
import { MemberModalForm } from "../../Common/ModalForm/ModalForm";
import { ModalBackground } from "../../Common/ModalBackground/ModalBackground";
import { SearchboxForMemberModal } from "../../Search/SearchboxForMemberModal/SearchboxForMemberModal";
import { SuggestedCardListForMemberModal } from "../SuggestedCardListForMemberModal/SuggestedCardListForMemberModal";

import "./MemberModal.css";

const Component = ({
  enabled,
  candidates,
  buttonEnabled,
  highlighted,
  updateMemberModal,
  addMember,
}: Props) => {
  const handleClick = async () => {
    const memberIds = candidates.map((c) => c.id);
    try {
      addMember(memberIds, highlighted);
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  };

  return (
    <ModalBackground
      id="member-modal"
      enabled={enabled}
      onClick={updateMemberModal}
    >
      <MemberModalForm
        title="Add new member to this channel"
        subtitle="Start typing a name to add new users to your channel"
      >
        <div className="modal-forms-compoents-buttons">
          <div className="moda-forms-top">
            <SearchboxForMemberModal />
            <SuggestedCardListForMemberModal />
            <CandidateListForMemberModal />
          </div>
          <div className="modal-forms-bottom">
            <Button
              value="save"
              enabled={buttonEnabled}
              onClick={handleClick}
            />
          </div>
        </div>
      </MemberModalForm>
    </ModalBackground>
  );
};

const mapStateToProps = (state: RootState) => ({
  enabled: state.channel.memberModalEnabled,
  candidates: state.channel.candidates,
  buttonEnabled: state.channel.addMemberButtonEnabled,
  highlighted: state.channel.highlighted,
});

const mapDispatchToProps = {
  updateMemberModal: thunkUpdateMemberModal,
  addMember: thunkAddMemberToChannel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const MemberModal = connector(Component);
