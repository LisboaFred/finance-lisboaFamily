// routes/user.js
const router = require('express').Router();

router.get("/", (req, res) => {
  res.json({ message: "Rota de usuários funcionando!" });
});

module.exports = router;
