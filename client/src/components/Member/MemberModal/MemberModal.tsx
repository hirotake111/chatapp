import { connect, ConnectedProps } from "react-redux";

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
import { CandidateList } from "../../Search/CandidateList/CandidateList";
import { SuggestedCardList } from "../../Search/SuggestedCardList/SuggestedCardList";

import { useAppSelector } from "../../../hooks/reduxHooks";

import "./MemberModal.css";
import { MouseEventHandler } from "react";

const Component = ({
  updateMemberModal,
  addMember,
  addCandidate,
  removeCandidate,
}: Props) => {
  const {
    memberModalEnabled,
    candidates,
    addMemberButtonEnabled,
    searchStatus,
  } = useAppSelector((state) => state.channel);

  const handleClickBackgrond: MouseEventHandler = (e) => {
    const element = e.target as HTMLElement;
    if (element.id && element.id === "member-modal") updateMemberModal(false);
  };

  return (
    <ModalBackground
      id="member-modal"
      enabled={memberModalEnabled}
      onClick={handleClickBackgrond}
    >
      <ModalForm
        title="Add new member to this channel"
        subtitle="Start typing a name to add new users to your channel"
      >
        <div className="modal-forms-compoents-buttons">
          <div className="modal-forms-top">
            <SearchboxForMemberModal />
            <SuggestedCardList
              status={searchStatus}
              onCardClick={addCandidate}
            />
            <CandidateList candidates={candidates} onClick={removeCandidate} />
          </div>
          <div className="modal-forms-bottom">
            <Button
              enabled={addMemberButtonEnabled}
              onClick={() => addMember(candidates.map((c) => c.id))}
            >
              save
            </Button>
          </div>
        </div>
      </ModalForm>
    </ModalBackground>
  );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  updateMemberModal: thunkUpdateMemberModal,
  addMember: thunkAddMemberToChannel,
  addCandidate: thunkAddCandidateToExistingChannel,
  removeCandidate: thunkRemoveCandidateFromExistingChannel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux;

export const MemberModal = connector(Component);
