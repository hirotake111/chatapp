import "./ProfileModal.css";

export const ProfileModal = ({ show }: { show: boolean }) => {
  return (
    <div className="profile-modal" style={{ display: show ? "flex" : "none" }}>
      <ul>
        <li>ProfileModal</li>
        <li>----</li>
        <li>----</li>
      </ul>
    </div>
  );
};
