import { useContext, useEffect, useEffectEvent, useId } from "react";
import ToastContext from "./ToastContext";

// Bridge existing message state to the shared toast queue without occupying page space.
export default function Toast({ children, severity = "info", action, onClose }) {
  const notify = useContext(ToastContext);
  const id = useId();
  const message = Array.isArray(children) ? children.join("") : children;
  const publish = useEffectEvent(() => {
    notify({ id, message, severity, action, onClose });
  });
  useEffect(() => {
    if (message) publish();
  }, [message, severity]);
  return null;
}
