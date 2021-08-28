import { ReactNode } from "react";

import "./ModalForm.css";

export const MemberModalForm = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div id="modal-content" className="modal-content">
    <span className="modal-content-title">{title}</span>
    <span className="modal-content-span">{subtitle} </span>
    {children}
  </div>
);
