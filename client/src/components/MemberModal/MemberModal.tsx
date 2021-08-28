import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../store";

import { thunkUpdateMemberModal } from "../../thunk-middlewares";
import { CandidateListForMemberModal } from "../CandidateListForMemberModal/CandidateListForMemberModal";
import { Button } from "../Button/Button";
import { MemberModalForm } from "../ModalForm/ModalForm";
import { ModalBackground } from "../ModalBackground/ModalBackground";
import { SearchboxForMemberModal } from "../SearchboxForMemberModal/SearchboxForMemberModal";
import { SuggestedCardListForMemberModal } from "../SuggestedCardListForMemberModal/SuggestedCardListForMemberModal";

import "./MemberModal.css";

const Component = ({ enabled, updateMemberModal }: Props) => {
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
            <Button value="save" onClick={() => {}} />
          </div>
        </div>
      </MemberModalForm>
    </ModalBackground>
  );
};

const mapStateToProps = (state: RootState) => ({
  enabled: state.channel.memberModalEnabled,
});

const mapDispatchToProps = {
  updateMemberModal: thunkUpdateMemberModal,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const MemberModal = connector(Component);
