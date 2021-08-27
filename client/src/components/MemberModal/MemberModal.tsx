import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../store";
import { thunkUpdateMemberModal } from "../../thunk-middlewares";
import { MemberModalForm } from "../MemberModalForm/MemberModalForm";
import { Modal } from "../Modal/Modal";

const Component = ({ enabled, updateMemberModal }: Props) => {
  return (
    <Modal id="member-modal" enabled={enabled} onClick={updateMemberModal}>
      <MemberModalForm />
    </Modal>
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
