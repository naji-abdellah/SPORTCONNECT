const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  joinSession,
  leaveSession,
  cancelSession,
  deleteSession
} = require("../controllers/sessionController");

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSessionById);
router.put("/:id", updateSession);
router.post("/:id/join", joinSession);
router.post("/:id/leave", leaveSession);
router.post("/:id/cancel", cancelSession);
router.delete("/:id", deleteSession);

module.exports = router;