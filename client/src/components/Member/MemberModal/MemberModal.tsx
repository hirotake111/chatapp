import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../../utils/store";

import {
  thunkAddCandidateToExistingChannel,
  thunkAddMemberToChannel,
  thunkRemoveCandidateFromExistingChannel,
  thunkUpdateMemberModal,
} from "../../../utils/thunk-middlewares";
import { Button } from "../../Common/Button/Button";
import { ModalForm } from "../../Common/ModalForm/ModalForm";
import { ModalBackground } from "../../Common/ModalBackground/ModalBackground";
import { SearchboxForMemberModal } from "../../Search/SearchboxForMemberModal/SearchboxForMemberModal";

import "./MemberModal.css";
import { CandidateList } from "../../Search/CandidateList/CandidateList";
import { SuggestedCardList } from "../../Search/SuggestedCardList/SuggestedCardList";

const Component = ({
  enabled,
  candidates,
  buttonEnabled,
  highlighted,
  searchStatus,
  updateMemberModal,
  addMember,
  addCandidate,
  removeCandidate,
}: Props) => {
  const handleClick = async () => {
    const memberIds = candidates.map((c) => c.id);
    try {
      addMember(memberIds, highlighted);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ModalBackground
      id="member-modal"
      enabled={enabled}
      onClick={updateMemberModal}
    >
      <ModalForm
        title="Add new member to this channel"
        subtitle="Start typing a name to add new users to your channel"
      >
        <div className="modal-forms-compoents-buttons">
          <div className="moda-forms-top">
            <SearchboxForMemberModal />
            <SuggestedCardList
              status={searchStatus}
              onCardClick={addCandidate}
            />
            <CandidateList candidates={candidates} onClick={removeCandidate} />
          </div>
          <div className="modal-forms-bottom">
            <Button
              value="save"
              enabled={buttonEnabled}
              onClick={handleClick}
            />
          </div>
        </div>
      </ModalForm>
    </ModalBackground>
  );
};

const mapStateToProps = (state: RootState) => ({
  enabled: state.channel.memberModalEnabled,
  candidates: state.channel.candidates,
  buttonEnabled: state.channel.addMemberButtonEnabled,
  highlighted: state.channel.highlighted,
  searchStatus: state.channel.searchStatus,
});

const mapDispatchToProps = {
  updateMemberModal: thunkUpdateMemberModal,
  addMember: thunkAddMemberToChannel,
  addCandidate: thunkAddCandidateToExistingChannel,
  removeCandidate: thunkRemoveCandidateFromExistingChannel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const MemberModal = connector(Component);
