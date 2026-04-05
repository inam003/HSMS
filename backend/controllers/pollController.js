import Poll from "../models/Poll.js";
import PollOption from "../models/PollOption.js";

export const getPolls = async (req, res) => {
  const polls = await Poll.find().sort({ createdAt: -1 });
  res.json(polls);
};

export const createPoll = async (req, res) => {
  const { Title, Description, StartDate, EndDate, PollType, ResultsVisible, options } = req.body;
  const poll = await Poll.create({ Title, Description, StartDate, EndDate, PollType, ResultsVisible, createdBy: req.user._id });
  if (options && options.length) {
    await PollOption.insertMany(options.map((text) => ({ poll: poll._id, OptionText: text })));
  }
  res.status(201).json(poll);
};

export const getPollWithOptions = async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ message: "Poll not found" });
  const options = await PollOption.find({ poll: poll._id });
  const hasVoted = req.user && poll.voters.includes(req.user._id);
  res.json({ poll, options, hasVoted });
};

export const vote = async (req, res) => {
  const { optionId } = req.body;
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ message: "Poll not found" });
  if (!poll.IsActive) return res.status(400).json({ message: "Poll is closed" });
  if (poll.voters.includes(req.user._id)) {
    return res.status(400).json({ message: "You have already voted" });
  }
  const option = await PollOption.findById(optionId);
  if (!option) return res.status(404).json({ message: "Option not found" });

  option.VoteCount += 1;
  await option.save();
  poll.voters.push(req.user._id);
  await poll.save();

  res.json({ message: "Vote recorded", option });
};

export const closePoll = async (req, res) => {
  const poll = await Poll.findByIdAndUpdate(req.params.id, { IsActive: false, ResultsVisible: true }, { new: true });
  res.json(poll);
};

export const deletePoll = async (req, res) => {
  await Poll.findByIdAndDelete(req.params.id);
  await PollOption.deleteMany({ poll: req.params.id });
  res.json({ message: "Poll deleted" });
};
