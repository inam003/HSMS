import Notice from "../models/Notice.js";

export const getNotices = async (req, res) => {
  const filter = req.userRole === "resident" ? { IsActive: true } : {};
  const notices = await Notice.find(filter).populate("publishedBy", "Name").sort({ createdAt: -1 });
  res.json(notices);
};

export const createNotice = async (req, res) => {
  const notice = await Notice.create({ ...req.body, publishedBy: req.user._id });
  res.status(201).json(notice);
};

export const updateNotice = async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!notice) return res.status(404).json({ message: "Notice not found" });
  res.json(notice);
};

export const publishNotice = async (req, res) => {
  const { emergencyFlag } = req.body;
  const notice = await Notice.findById(req.params.id);
  if (!notice) return res.status(404).json({ message: "Notice not found" });
  notice.IsActive = true;
  notice.PublishDate = new Date();
  if (emergencyFlag) {
    notice.NoticeType = "Emergency";
    notice.Priority = "High";
  }
  await notice.save();
  res.json(notice);
};

export const expireNotice = async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, { IsActive: false }, { new: true });
  if (!notice) return res.status(404).json({ message: "Notice not found" });
  res.json(notice);
};

export const deleteNotice = async (req, res) => {
  await Notice.findByIdAndDelete(req.params.id);
  res.json({ message: "Notice deleted" });
};

export const triggerSOS = async (req, res) => {
  const { location } = req.body;
  const sos = await Notice.create({
    Title: `🚨 SOS ALERT - Unit: ${req.user.Name}`,
    Content: `Emergency SOS triggered by ${req.user.Name}. Location: ${location || "Not provided"}. Immediate response required!`,
    NoticeType: "Emergency",
    Priority: "High",
    IsActive: true,
    publishedBy: null,
    PublishDate: new Date(),
  });
  res.status(201).json({ message: "SOS alert sent!", sos });
};
