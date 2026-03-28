const Project = require('../models/Project');

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching project detail' });
  }
};



exports.getLeaderboard = async (req, res) => {
  try {
    // Leaderboard sorted by "Best" votes
    const stats = await Project.aggregate([
      {
        $project: {
          title: 1,
          teamName: 1,
          votesCount: { $add: ["$votes.best", "$votes.good", "$votes.moderate"] },
          bestCount: "$votes.best",
          goodCount: "$votes.good",
          moderateCount: "$votes.moderate"
        }
      },
      { $sort: { bestCount: -1, goodCount: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error generating leaderboard' });
  }
};
