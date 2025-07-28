const router = require('express').Router();
const auth   = require('../middlewares/authMiddleware');
const role   = require('../middlewares/roleMiddleware');
const { listUsers, moderateUpdate } = require('../controllers/userController');

router.get(
  '/users',
  auth,
  role(['moderator','admin']),
  listUsers
);

router.put(
  '/users/:id',
  auth,
  role(['moderator','admin']),
  moderateUpdate
);

module.exports = router;