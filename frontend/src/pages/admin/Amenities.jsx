import AdminDialog, { AdminDialogHeader as ModalHeader, AdminDeleteDialog } from "../../components/common/AdminDialog";
import Toast from "../../components/common/Toast";
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, DialogContent,
  DialogActions, TextField, Divider, CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import SpaIcon from "@mui/icons-material/Spa";
import SearchRounded from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import PoolOutlined from "@mui/icons-material/PoolOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PeopleOutlineRounded from "@mui/icons-material/PeopleOutlineRounded";
import TollOutlined from "@mui/icons-material/TollOutlined";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import api from "../../api/axios";
import "./Members.css";
import "./Amenities.css";

const money = value => `PKR ${Number(value || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
const dateLabel = value => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";
};
const AmenityIcon = ({ name }) => /pool|swim/i.test(name) ? <PoolOutlined/> : /hall|community|club/i.test(name) ? <ApartmentOutlined/> : /event|eid|meeting/i.test(name) ? <CalendarMonthOutlined/> : <SpaIcon/>;
const bookingStatusClass = value => ({ Pending: "pending", Confirmed: "confirmed", Cancelled: "cancelled" })[value] || "pending";


const validate = (form) => ({
  Name:        !form.Name.trim()                   ? "Amenity name is required"          : "",
  Capacity:    !form.Capacity                      ? "Capacity is required"
             : Number(form.Capacity) <= 0          ? "Capacity must be greater than 0"   : "",
  Booking_Fee: form.Booking_Fee === ""             ? "Booking fee is required"
             : Number(form.Booking_Fee) < 0        ? "Booking fee cannot be negative"    : "",
});

const Amenities = () => {
  const [tab, setTab]                   = useState(0);
  const [amenities, setAmenities]       = useState([]);
  const [bookings, setBookings]         = useState([]);
  const [amenitySearch, setAmenitySearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [actionError, setActionError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const pageSize = 10;
  const pendingCount = bookings.filter(booking => booking.Status === "Pending").length;
  const amenityQuery = amenitySearch.trim().toLowerCase();
  const visibleAmenities = amenities.filter(amenity => [amenity.Name, amenity.Description].some(value => (value || "").toLowerCase().includes(amenityQuery)));
  const bookingQuery = bookingSearch.trim().toLowerCase();
  const filteredBookings = bookings.filter(booking => (!bookingStatus || booking.Status === bookingStatus) && [booking.amenity?.Name, booking.resident?.Name, booking.Time_Slot].some(value => (value || "").toLowerCase().includes(bookingQuery)));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredBookings.length / pageSize)));
  const visibleBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [open, setOpen]                 = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState({ Name: "", Capacity: "", Booking_Fee: "", Description: "" });
  const [touched, setTouched]           = useState({});
  const [submitError, setSubmitError]   = useState("");
  const [success, setSuccess]           = useState("");
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = async () => {
    try {
      setLoadError("");
      const [a, b] = await Promise.all([api.get("/amenities"), api.get("/amenities/bookings")]);
      setAmenities(a.data); setBookings(b.data);
    } catch (e) { setLoadError(e.response?.data?.message || "Unable to load amenities and bookings. Please try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const errors  = validate(form);
  const isValid = !errors.Name && !errors.Capacity && !errors.Booking_Fee;

  const field = (key) => ({
    error:      !!touched[key] && !!errors[key],
    helperText: touched[key] && errors[key] ? errors[key] : " ",
    onBlur:     () => setTouched((t) => ({ ...t, [key]: true })),
  });

  const handleOpen = (a = null) => {
    setEditId(a?._id || null);
    setForm(a
      ? { Name: a.Name, Capacity: a.Capacity, Booking_Fee: a.Booking_Fee, Description: a.Description || "" }
      : { Name: "", Capacity: "", Booking_Fee: "", Description: "" });
    setTouched({}); setSubmitError(""); setOpen(true);
  };

  const handleSave = async () => {
    setTouched({ Name: true, Capacity: true, Booking_Fee: true });
    if (!isValid || saving) return;
    setSaving(true); setSubmitError("");
    try {
      if (editId) await api.put(`/amenities/${editId}`, form);
      else await api.post("/amenities", form);
      setSuccess("Amenity saved!"); setOpen(false); load();
    } catch (e) { setSubmitError(e.response?.data?.message || "Error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true); setDeleteError("");
    try {
      await api.delete(`/amenities/${deleteTarget.id}`);
      setSuccess("Amenity deleted."); setDeleteTarget(null); load();
    } catch (e) { setDeleteError(e.response?.data?.message || "Unable to delete this amenity. Please try again."); }
    finally { setDeleting(false); }
  };

  const handleBookingAction = async (id, status) => {
    if (updatingId) return;
    setUpdatingId(id); setActionError("");
    try {
      await api.put(`/amenities/bookings/${id}`, { Status: status });
      setSuccess(status === "Confirmed" ? "Booking approved." : "Booking rejected.");
      await load();
    } catch (e) { setActionError(e.response?.data?.message || "Unable to update this booking. Please try again."); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="hs-amenity-management">
      <div className="hs-page-heading hs-members-heading hs-amenity-heading"><div><h1>Amenity Management</h1><p>Manage shared facilities and resident bookings.</p></div><button className="hs-resident-add" onClick={() => handleOpen()}><AddIcon/>Add amenity</button></div>
      {success && <Toast severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Toast>}
      {loadError && <Toast severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => { setLoading(true); load(); }}>Retry</Button>}>{loadError}</Toast>}
      {actionError && <Toast severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>{actionError}</Toast>}
      <div className="hs-amenity-tabs" role="group" aria-label="Select amenity management view"><button className={tab === 0 ? "active" : ""} aria-pressed={tab === 0} onClick={() => setTab(0)}>Amenities<span>{amenities.length}</span></button><button className={tab === 1 ? "active" : ""} aria-pressed={tab === 1} onClick={() => setTab(1)}>Bookings<span>{bookings.length}</span></button>{pendingCount > 0 && <span className="hs-amenity-pending"><i/>{pendingCount} pending</span>}</div>
      {tab === 0 ? <>
        <label className="hs-resident-search hs-amenity-search"><SearchRounded/><input type="search" aria-label="Search amenities by name or description" placeholder="Search amenities..." value={amenitySearch} onChange={e => setAmenitySearch(e.target.value)}/></label>
        <section className="hs-amenity-grid" aria-label="Shared amenities" aria-busy={loading}>
          {loading ? <div className="hs-panel hs-loading" role="status"><CircularProgress size={28}/>Loading amenities...</div> : visibleAmenities.map(amenity => <article className="hs-panel hs-amenity-card" key={amenity._id}>
            <div className="hs-amenity-card-heading"><span className="hs-amenity-icon"><AmenityIcon name={amenity.Name}/></span><h2>{amenity.Name}</h2></div><p className="hs-amenity-description">{amenity.Description || "No description provided."}</p>
            <div className="hs-amenity-metrics"><div><PeopleOutlineRounded/><span><small>Capacity</small><strong>{Number(amenity.Capacity || 0).toLocaleString("en-PK")} {Number(amenity.Capacity) === 1 ? "person" : "people"}</strong></span></div><div><TollOutlined/><span><small>Booking fee</small><strong>{money(amenity.Booking_Fee)}</strong></span></div></div>
            <div className="hs-resident-actions hs-amenity-card-actions"><button title="Edit amenity" aria-label={`Edit ${amenity.Name}`} onClick={() => handleOpen(amenity)}><EditOutlined/></button><button className="hs-resident-delete" title="Delete amenity" aria-label={`Delete ${amenity.Name}`} onClick={() => { setDeleteError(""); setDeleteTarget({ id: amenity._id, name: amenity.Name }); }}><DeleteOutlineRounded/></button></div>
          </article>)}
          {!loading && !visibleAmenities.length && <div className="hs-panel hs-empty">{loadError ? "Amenity data unavailable" : amenities.length ? "No amenities match your search." : "No amenities added yet."}</div>}
        </section>
        {!loading && pendingCount > 0 && <button className="hs-amenity-review" onClick={() => { setTab(1); setBookingSearch(""); setBookingStatus("Pending"); setPage(1); }}><i/><span>{pendingCount} {pendingCount === 1 ? "booking" : "bookings"} awaiting review</span><ArrowForwardRounded/></button>}
      </> : <section className="hs-panel hs-bookings-panel" aria-label="Amenity bookings" aria-busy={loading}>
        <h2>All bookings <span>{bookings.length}</span></h2>
        <div className="hs-residents-filters hs-bookings-filters"><label className="hs-resident-search"><SearchRounded/><input type="search" aria-label="Search bookings by amenity, resident or time slot" placeholder="Search bookings..." value={bookingSearch} onChange={e => { setBookingSearch(e.target.value); setPage(1); }}/></label><div className="hs-resident-filter"><select aria-label="Filter bookings by status" value={bookingStatus} onChange={e => { setBookingStatus(e.target.value); setPage(1); }}><option value="">All statuses</option>{["Pending", "Confirmed", "Cancelled"].map(value => <option key={value} value={value}>{value}</option>)}</select><KeyboardArrowDownRounded/></div></div>
        <div className="hs-residents-table-wrap"><table className="hs-residents-table hs-bookings-table"><thead><tr>{["Amenity", "Resident", "Date", "Time slot", "Status", "Actions"].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>
          {loading ? <tr><td colSpan={6}><div className="hs-residents-loading" role="status"><CircularProgress size={26}/>Loading bookings...</div></td></tr> : visibleBookings.map(booking => <tr key={booking._id}><td><strong>{booking.amenity?.Name || "Deleted amenity"}</strong></td><td>{booking.resident?.Name || "—"}</td><td>{dateLabel(booking.Booking_Date)}</td><td>{booking.Time_Slot || "—"}</td><td><span className={`hs-booking-status ${bookingStatusClass(booking.Status)}`}><i/>{booking.Status}</span></td><td>{booking.Status === "Pending" ? <div className="hs-booking-actions"><button disabled={updatingId !== null} className="hs-booking-approve" aria-label={`Approve booking for ${booking.amenity?.Name || "deleted amenity"} on ${dateLabel(booking.Booking_Date)}`} onClick={() => handleBookingAction(booking._id, "Confirmed")}><CheckRounded/>{updatingId === booking._id ? "Updating..." : "Approve"}</button><button disabled={updatingId !== null} className="hs-booking-reject" aria-label={`Reject booking for ${booking.amenity?.Name || "deleted amenity"} on ${dateLabel(booking.Booking_Date)}`} onClick={() => handleBookingAction(booking._id, "Cancelled")}><CloseRounded/>Reject</button></div> : "—"}</td></tr>)}
          {!loading && !visibleBookings.length && <tr><td colSpan={6} className="hs-empty">{loadError ? "Booking data unavailable" : bookings.length ? "No bookings match your search or filter." : "No bookings found."}</td></tr>}
        </tbody></table></div>
        <div className="hs-residents-pagination"><span aria-live="polite">Showing {filteredBookings.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredBookings.length)} of {filteredBookings.length} bookings</span><div><button disabled={loading || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeftRounded/>Previous</button><button disabled={loading || currentPage * pageSize >= filteredBookings.length} onClick={() => setPage(currentPage + 1)}>Next<ChevronRightRounded/></button></div></div>
      </section>}

      {/* ── Add / Edit Dialog ── */}
      <AdminDialog busy={saving} open={open} onClose={() => { if (!saving) setOpen(false); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <ModalHeader icon={<SpaIcon />} title={editId ? "Edit Amenity" : "Add Amenity"}
          subtitle={editId ? "Update amenity details" : "Enter amenity information"} />
        <DialogContent sx={{ pt: 3, pb: 1, px: 3 }}>
          {submitError && <Toast severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSubmitError("")}>{submitError}</Toast>}
          <TextField fullWidth label="Amenity Name" required value={form.Name}
            onChange={(e) => setForm({ ...form, Name: e.target.value })} {...field("Name")} />
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} mb={1}>
            <TextField fullWidth label="Capacity" type="number" required value={form.Capacity}
              onChange={(e) => setForm({ ...form, Capacity: e.target.value })} {...field("Capacity")} />
            <TextField fullWidth label="Booking Fee (PKR)" type="number" required value={form.Booking_Fee}
              onChange={(e) => setForm({ ...form, Booking_Fee: e.target.value })} {...field("Booking_Fee")} />
          </Box>
          <TextField fullWidth label="Description" multiline rows={2} value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })} helperText=" " />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button disabled={saving} onClick={() => setOpen(false)} sx={{ color: "#555", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!isValid || saving}
            sx={{ bgcolor: "#0854ed", borderRadius: 2, px: 3, minWidth: 120, "&:disabled": { bgcolor: "#c5cae9", color: "#fff" } }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : (editId ? "Save Changes" : "Add Amenity")}
          </Button>
        </DialogActions>
      </AdminDialog>

      {/* ── Delete Dialog ── */}
      <AdminDeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} busy={deleting} title="Delete Amenity?" name={deleteTarget?.name}>
        {deleteError && <Toast severity="error">{deleteError}</Toast>}
      </AdminDeleteDialog>
    </div>
  );
};

export default Amenities;
