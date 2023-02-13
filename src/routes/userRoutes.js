const express = require("express");
const {
  changeName,
  getTrustedAccounts,
  addTrustedAccount,
  deleteTrustedAccount,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");
const protect = require("../middleware/protect");

const router = express.Router();

router.put("/change-name", protect, changeName);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);
router.get("/trusted-accounts", protect, getTrustedAccounts);
router.post("/trusted-accounts", protect, addTrustedAccount);
router.delete("/trusted-accounts/:id", protect, deleteTrustedAccount);

module.exports = router;
