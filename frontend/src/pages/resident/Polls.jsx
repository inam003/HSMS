import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Button, Alert,
  Chip, LinearProgress, Radio, RadioGroup, FormControlLabel, CircularProgress
} from "@mui/material";
import HowToVoteIcon   from "@mui/icons-material/HowToVote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon  from "@mui/icons-material/AccessTime";
import api from "../../api/axios";

const typeColors = { General: "#1a237e", Housing: "#2e7d32", Maintenance: "#e65100", Other: "#6a1b9a" };

const Polls = () => {
  const [polls, setPolls]       = useState([]);
  const [selected, setSelected] = useState({});
  const [details, setDetails]   = useState({});
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState({});

  const load = async () => {
    const { data } = await api.get("/polls");
    setPolls(data.filter((p) => p.IsActive));
    data.forEach(async (p) => {
      const { data: d } = await api.get(`/polls/${p._id}`);
      setDetails((prev) => ({ ...prev, [p._id]: d }));
    });
  };
  useEffect(() => { load(); }, []);

  const handleVote = async (pollId) => {
    if (!selected[pollId]) return setError("Please select an option");
    setLoading((l) => ({ ...l, [pollId]: true }));
    try {
      await api.post(`/polls/${pollId}/vote`, { optionId: selected[pollId] });
      setSuccess("Vote recorded!"); load();
    } catch (e) { setError(e.response?.data?.message || "Error voting"); }
    setLoading((l) => ({ ...l, [pollId]: false }));
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>Active Polls</Typography>
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={2}>
        {polls.map((p) => {
          const d          = details[p._id];
          const totalVotes = d?.options?.reduce((s, o) => s + o.VoteCount, 0) || 0;
          const pollColor  = typeColors[p.PollType] || "#1a237e";
          const maxVotes   = d?.options ? Math.max(...d.options.map((o) => o.VoteCount)) : 0;

          return (
            <Grid item xs={12} md={6} key={p._id}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                height: "100%", display: "flex", flexDirection: "column" }}>

                {/* ── Colored Header ── */}
                <Box sx={{ bgcolor: pollColor, borderRadius: "8px 8px 0 0", px: 2.5, py: 1.8 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold" color="white"
                      noWrap sx={{ flex: 1, mr: 1 }}>{p.Title}</Typography>
                    <Chip label={p.PollType} size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: "bold", border: "none" }} />
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.4}>
                    <AccessTimeIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Ends: {new Date(p.EndDate).toLocaleDateString()}
                      {totalVotes > 0 && ` · ${totalVotes} vote${totalVotes !== 1 ? "s" : ""}`}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ flex: 1, pt: 2 }}>
                  {p.Description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>{p.Description}</Typography>
                  )}

                  {d?.hasVoted ? (
                    /* ── Results ── */
                    <Box>
                      <Box display="flex" alignItems="center" gap={0.5} mb={1.5}>
                        <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 18 }} />
                        <Typography variant="body2" color="#2e7d32" fontWeight="bold">You have already voted</Typography>
                      </Box>
                      {d.options?.map((opt) => {
                        const pct      = totalVotes ? Math.round((opt.VoteCount / totalVotes) * 100) : 0;
                        const isLeader = opt.VoteCount === maxVotes && maxVotes > 0;
                        return (
                          <Box key={opt._id} mb={1.5}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2" fontWeight={isLeader ? "bold" : "normal"}>
                                {isLeader ? "🏆 " : ""}{opt.OptionText}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color={pollColor}>{pct}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={pct}
                              sx={{ height: 8, borderRadius: 4, bgcolor: "#f0f0f0",
                                "& .MuiLinearProgress-bar": { bgcolor: pollColor, borderRadius: 4 } }} />
                            <Typography variant="caption" color="text.secondary">
                              {opt.VoteCount} vote{opt.VoteCount !== 1 ? "s" : ""}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    /* ── Vote Options ── */
                    <RadioGroup value={selected[p._id] || ""}
                      onChange={(e) => setSelected({ ...selected, [p._id]: e.target.value })}>
                      {d?.options?.map((opt) => (
                        <Box key={opt._id}
                          onClick={() => setSelected({ ...selected, [p._id]: opt._id })}
                          sx={{
                            border: `2px solid ${selected[p._id] === opt._id ? pollColor : "#e8eaf6"}`,
                            borderRadius: 2, px: 1.5, py: 1, mb: 1, cursor: "pointer",
                            bgcolor: selected[p._id] === opt._id ? `${pollColor}12` : "transparent",
                            transition: "all 0.15s",
                          }}>
                          <FormControlLabel value={opt._id}
                            control={<Radio size="small" sx={{ color: pollColor, "&.Mui-checked": { color: pollColor } }} />}
                            label={<Typography variant="body2">{opt.OptionText}</Typography>}
                            sx={{ m: 0, width: "100%", pointerEvents: "none" }} />
                        </Box>
                      ))}
                      {!d && (
                        <Box display="flex" justifyContent="center" py={2}>
                          <CircularProgress size={24} sx={{ color: pollColor }} />
                        </Box>
                      )}
                    </RadioGroup>
                  )}
                </CardContent>

                {!d?.hasVoted && (
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant="contained"
                      startIcon={loading[p._id]
                        ? <CircularProgress size={16} color="inherit" />
                        : <HowToVoteIcon />}
                      onClick={() => handleVote(p._id)}
                      disabled={loading[p._id] || !selected[p._id]}
                      sx={{ bgcolor: pollColor, borderRadius: 2, py: 1.2,
                        "&:disabled": { bgcolor: "#e0e0e0", color: "#aaa" } }}>
                      Cast Vote
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}

        {!polls.length && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <HowToVoteIcon sx={{ fontSize: 64, color: "#ddd", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={0.5}>No Active Polls</Typography>
              <Typography variant="body2" color="text.secondary">
                Check back later — the society management will post polls here
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Polls;
