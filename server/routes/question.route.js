const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/question.controller');

router.get('/', QuestionController.getAll);
router.get('/:id', QuestionController.getById);
router.post('/', QuestionController.create);
router.put('/:id', QuestionController.update);
router.delete('/:id', QuestionController.delete);
router.get('/stats/all', QuestionController.getStats);
router.post('/filter', QuestionController.filter);
router.get('/resolvers/list', QuestionController.getResolvers);

module.exports = router;
