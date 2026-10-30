import { Box } from "@mui/material";

export function PortalPageTitle({ children, subtitle }) {
  return <div className="hs-portal-page-title"><h1>{children}</h1><p>{subtitle}</p></div>;
}
export function PortalStatCard({ label, value, color, icon }) {
  return <section className="hs-panel hs-portal-stat" style={{ "--stat-tone": color }}><div><h2>{label}</h2><strong>{value}</strong></div><span aria-hidden="true">{icon}</span></section>;
}
export function PortalSectionTitle({ icon, title }) {
  return <Box className="hs-portal-section-title"><span aria-hidden="true">{icon}</span><h2>{title}</h2></Box>;
}
