import { useCallback, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import ToastContext from "./ToastContext";

export default function ToastProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const notify = useCallback(notification => {
    setQueue(previous => {
      const index = previous.findIndex(item => item.id === notification.id);
      if (index === -1) return [...previous, notification];
      return previous.map((item, i) => i === index ? notification : item);
    });
  }, []);
  const current = queue[0];
  const dismiss = (_, reason) => {
    if (reason === "clickaway") return;
    setQueue(previous => previous.slice(1));
    current?.onClose?.();
  };

  return <ToastContext.Provider value={notify}>
    {children}
    {current && <Snackbar
      key={current.id}
      open
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      autoHideDuration={current.severity === "error" ? 7000 : 4000}
      onClose={dismiss}
      sx={{ zIndex: theme => theme.zIndex.modal + 100, maxWidth: { xs: "calc(100% - 32px)", sm: 440 } }}
    >
      <Alert
        severity={current.severity}
        variant="filled"
        role={current.severity === "error" ? "alert" : "status"}
        action={current.action ? <span onClick={dismiss}>{current.action}</span> : undefined}
        sx={{ width: "100%", borderRadius: 2, boxShadow: "0 8px 30px #10183f26", alignItems: "center", fontSize: 14, "& .MuiAlert-message": { overflowWrap: "anywhere" } }}
      >{current.message}</Alert>
    </Snackbar>}
  </ToastContext.Provider>;
}
