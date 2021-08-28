import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../store";

import {
  thunkAddMemberToChannel,
  thunkUpdateMemberModal,
} from "../../thunk-middlewares";
import { CandidateListForMemberModal } from "../CandidateListForMemberModal/CandidateListForMemberModal";
import { Button } from "../Button/Button";
import { MemberModalForm } from "../ModalForm/ModalForm";
import { ModalBackground } from "../ModalBackground/ModalBackground";
import { SearchboxForMemberModal } from "../SearchboxForMemberModal/SearchboxForMemberModal";
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
              onClick={() =>
                addMember(
                  candidates.map((c) => c.id),
                  highlighted
                )
              }
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
