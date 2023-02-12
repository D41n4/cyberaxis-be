const express = require("express");
const {
  changeName,
  getTrustedAccounts,
  addTrustedAccount,
  deleteTrustedAccount,
} = require("../controllers/userController");
const protect = require("../middleware/protect");

const router = express.Router();

router.put("/change-name", protect, changeName);
router.get("/trusted-accounts", protect, getTrustedAccounts);
router.post("/trusted-accounts", protect, addTrustedAccount);
router.delete("/trusted-accounts/:id", protect, deleteTrustedAccount);

module.exports = router;
