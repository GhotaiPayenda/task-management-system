const express = require('express');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.get('/', taskController.list);
router.get('/:id', taskController.getOne);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.patch('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.remove);

module.exports = router;
