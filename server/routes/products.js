const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/',       listProducts);
router.get('/:id',    getProduct);

// Admin only
router.post('/',      auth, role(['admin']), createProduct);
router.put('/:id',    auth, role(['admin']), updateProduct);
router.delete('/:id', auth, role(['admin']), deleteProduct);

module.exports = router;