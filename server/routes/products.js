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

// Public : lister tous les produits
router.get('/', listProducts);

// Public : récupérer un produit par son ID
router.get('/:id', getProduct);

// === Opérations réservées aux admins ===
// Créer un produit (doit fournir title, description, price, stock, image_url)
router.post('/', auth, role(['admin']), createProduct);

// Mettre à jour un produit existant (y compris son stock)
router.put('/:id', auth, role(['admin']), updateProduct);

// Supprimer un produit
router.delete('/:id', auth, role(['admin']), deleteProduct);

module.exports = router;