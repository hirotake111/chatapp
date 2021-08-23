import "./Modal.css";

export const Modal = ({ enabled }: { enabled: boolean }) => {
  return enabled ? (
    <>
      <div className="modal-background">
        <div id="modal-content" className="modal-content">
          <span className="modal-content-title">
            Add new member to this channel
          </span>
          <span className="modal-content-span">
            Start typing a name to add new users to your channel
          </span>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};
