const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const { listUserOrders, createOrder } = require('../controllers/orderController');

router.get('/my', auth, listUserOrders);
router.post('/',  auth, createOrder);

module.exports = router;