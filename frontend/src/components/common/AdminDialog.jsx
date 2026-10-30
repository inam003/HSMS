import { createContext, useContext, useId } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent } from "@mui/material";
import CloseRounded from "@mui/icons-material/CloseRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import "./AdminDialog.css";

const DialogContext = createContext(null);

export default function AdminDialog({ children, onClose, busy = false, danger = false, className = "", PaperProps, ...props }) {
  const titleId = useId();
  const close = () => { if (!busy) onClose?.(); };
  return <DialogContext.Provider value={{ titleId, close, busy }}>
    <Dialog {...props} onClose={close} aria-labelledby={titleId} className={`hs-admin-dialog${danger ? " hs-admin-dialog-danger" : ""} ${className}`} PaperProps={{ ...PaperProps, className: `hs-admin-dialog-paper ${PaperProps?.className || ""}` }}>{children}</Dialog>
  </DialogContext.Provider>;
}

export function AdminDialogHeader({ icon, title, subtitle }) {
  const { titleId, close, busy } = useContext(DialogContext);
  return <header className="hs-admin-dialog-header">
    <span className="hs-admin-dialog-icon" aria-hidden="true">{icon}</span>
    <div><h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    <button type="button" className="hs-admin-dialog-close" aria-label="Close dialog" onClick={close} disabled={busy}><CloseRounded/></button>
  </header>;
}

export function AdminDeleteDialog({ open, onClose, onConfirm, busy, title, name, description, children }) {
  return <AdminDialog open={open} onClose={onClose} busy={busy} danger maxWidth="xs" fullWidth>
    <AdminDialogHeader icon={<DeleteOutlineRounded/>} title={title} subtitle="Confirm permanent deletion"/>
    <DialogContent>
      {children}
      <p className="hs-admin-delete-description">You are about to permanently delete this record:</p>
      <div className="hs-admin-delete-record">{name}</div>
      <div className="hs-admin-delete-warning"><WarningAmberRounded/><p>{description || "This action cannot be undone."}</p></div>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" disabled={busy} onClick={onClose}>Cancel</Button>
      <Button variant="contained" color="error" disabled={busy} onClick={onConfirm} startIcon={busy ? undefined : <DeleteOutlineRounded/>}>{busy ? <CircularProgress size={18} color="inherit"/> : "Delete"}</Button>
    </DialogActions>
  </AdminDialog>;
}
