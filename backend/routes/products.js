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

// ✅ Authentification requise pour savoir si admin et afficher les produits désactivés
router.get('/', auth, listProducts);

// Public : récupérer un produit par son ID
router.get('/:id', getProduct);

// === Opérations réservées aux admins ===
router.post('/', auth, role(['admin']), createProduct);
router.put('/:id', auth, role(['admin']), updateProduct);
router.delete('/:id', auth, role(['admin']), deleteProduct);

module.exports = router;
