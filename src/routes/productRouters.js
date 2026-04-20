const router = require('express').Router();
const controller = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/', controller.getAll);
router.post('/', auth, controller.create);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.remove);

module.exports = router;