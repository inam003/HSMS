import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent, CardActions, Grid, Button, Alert,
  Chip, LinearProgress, Radio, RadioGroup, FormControlLabel, CircularProgress
} from "@mui/material";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import api from "../../api/axios";

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [selected, setSelected] = useState({});
  const [details, setDetails] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({});

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
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Grid container spacing={2}>
        {polls.map((p) => {
          const d = details[p._id];
          const totalVotes = d?.options?.reduce((s, o) => s + o.VoteCount, 0) || 0;
          return (
            <Grid item xs={12} md={6} key={p._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">{p.Title}</Typography>
                    <Chip label={p.PollType} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>{p.Description}</Typography>
                  <Typography variant="caption">Ends: {new Date(p.EndDate).toLocaleDateString()}</Typography>

                  {d?.hasVoted ? (
                    <Box mt={2}>
                      <Alert severity="success" sx={{ mb: 1 }}>You have voted!</Alert>
                      {d.options?.map((opt) => (
                        <Box key={opt._id} mb={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">{opt.OptionText}</Typography>
                            <Typography variant="body2">{totalVotes ? Math.round((opt.VoteCount / totalVotes) * 100) : 0}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={totalVotes ? (opt.VoteCount / totalVotes) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box mt={2}>
                      <RadioGroup value={selected[p._id] || ""} onChange={(e) => setSelected({ ...selected, [p._id]: e.target.value })}>
                        {d?.options?.map((opt) => <FormControlLabel key={opt._id} value={opt._id} control={<Radio size="small" />} label={opt.OptionText} />)}
                      </RadioGroup>
                    </Box>
                  )}
                </CardContent>
                {!d?.hasVoted && (
                  <CardActions>
                    <Button variant="contained" startIcon={loading[p._id] ? <CircularProgress size={16} color="inherit" /> : <HowToVoteIcon />} onClick={() => handleVote(p._id)} disabled={loading[p._id]} sx={{ bgcolor: "#1a237e" }}>
                      Cast Vote
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          );
        })}
        {!polls.length && <Grid item xs={12}><Typography color="text.secondary" align="center">No active polls</Typography></Grid>}
      </Grid>
    </Box>
  );
};

export default Polls;
