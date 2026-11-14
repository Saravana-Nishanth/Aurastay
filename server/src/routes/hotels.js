const router = require('express').Router();
const controller = require('../controllers/hotels.controller');
const upload = require('../middleware/upload');
const { validateHotelPayload } = require('../middleware/validate');

// The field name the client must use for the photo is "image".
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', upload.single('image'), validateHotelPayload(true), controller.create);
router.put('/:id', upload.single('image'), validateHotelPayload(false), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
