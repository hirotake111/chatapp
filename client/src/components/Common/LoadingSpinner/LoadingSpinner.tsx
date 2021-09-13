import { useEffect } from "react";

import "./style.css";

export const LoadingSpinner = ({
  enabled,
  callback,
  ms,
}: {
  enabled: boolean;
  callback: () => void;
  ms: number;
}) => {
  useEffect(() => {
    // if enabled, do callback after {ms} ms
    // if disabled, this won't kick it
    if (enabled) {
      setTimeout(async () => {
        try {
          await callback();
        } catch (e) {
          if (e instanceof Error) return console.error(e.message);
          throw e;
        }
      }, ms);
    }
  }, [enabled, callback, ms]);

  return (
    <div className="loading-parent">
      <div className="dots-1"></div>
      <p className="loading-text">LOADING NOW...</p>
    </div>
  );
};
