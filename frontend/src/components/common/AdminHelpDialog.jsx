import { Dialog, DialogContent } from "@mui/material";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import CloseRounded from "@mui/icons-material/CloseRounded";
import "./AdminHelpDialog.css";

export default function AdminHelpDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      aria-labelledby="hs-admin-help-title"
      aria-describedby="hs-admin-help-description"
      className="hs-admin-help"
      slotProps={{ paper: { className: "hs-admin-help-paper" } }}
    >
      <header className="hs-admin-help-header">
        <span className="hs-admin-help-icon" aria-hidden="true"><HelpOutlineRounded /></span>
        <div>
          <h2 id="hs-admin-help-title">Administration help</h2>
          <p id="hs-admin-help-description">A quick guide to managing your society.</p>
        </div>
        <button className="hs-admin-help-close" aria-label="Close administration help" onClick={onClose}><CloseRounded /></button>
      </header>
      <DialogContent className="hs-admin-help-content">
        <section className="hs-admin-help-row">
          <GridViewOutlined aria-hidden="true" />
          <div><h3>Use the sidebar</h3><p>Manage residents, units, finances, community updates, and security from the sidebar.</p></div>
        </section>
        <section className="hs-admin-help-row">
          <OpenInNewRounded aria-hidden="true" />
          <div><h3>Use dashboard shortcuts</h3><p>Quick actions take you directly to the relevant management page.</p></div>
        </section>
        <section className="hs-admin-help-row">
          <LockOutlined aria-hidden="true" />
          <div><h3>Account access &amp; passwords</h3><p>Contact your system administrator for account access or password assistance.</p></div>
        </section>
      </DialogContent>
      <footer className="hs-admin-help-footer"><button onClick={onClose}>Got it</button></footer>
    </Dialog>
  );
}
