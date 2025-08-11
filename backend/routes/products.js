const router = require('express').Router();
const { body, param } = require('express-validator');

const validate     = require('../middlewares/validateMiddleware');
const requireAuth  = require('../middlewares/requireAuth');
const authOptional = require('../middlewares/authOptional');

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  reorderProducts
} = require('../controllers/productController');

// Public : liste (admin/modo connecté → voit tout avec include_hidden=true)
router.get('/', authOptional(), listProducts);

// 🔴 IMPORTANT : place /reorder AVANT toute route paramétrée "/:id"
router.put('/reorder',
  requireAuth('admin'),
  [ body('ids').isArray({ min: 1 }) ],
  validate,
  reorderProducts
);

// Public : détail (404 si masqué, sauf admin/modo)
router.get('/:id',
  authOptional(),
  [ param('id').isInt().toInt() ],
  validate,
  getProduct
);

// ADMIN : créer
router.post('/',
  requireAuth('admin'),
  [
    body('title').trim().isLength({ min: 1 }),
    body('price').isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('is_visible').optional().isBoolean(),
    body('is_summer_product').optional().isBoolean(),
  ],
  validate,
  createProduct
);

// ADMIN : mettre à jour
router.put('/:id',
  requireAuth('admin'),
  [
    param('id').isInt().toInt(),
    body('title').optional().trim().isLength({ min: 1 }),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('is_visible').optional().isBoolean(),
    body('is_summer_product').optional().isBoolean(),
  ],
  validate,
  updateProduct
);

// ADMIN : supprimer
router.delete('/:id',
  requireAuth('admin'),
  [ param('id').isInt().toInt() ],
  validate,
  deleteProduct
);

module.exports = router;
