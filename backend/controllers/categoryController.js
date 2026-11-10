const categoryModel = require('../models/categoryModel');
const { validateCategory, positiveId } = require('../utils/validators');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const categories = await categoryModel.findAll();
  res.json({ categories });
});

const getOne = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const category = await categoryModel.findById(id);
  if (!category) throw new HttpError(404, 'Category not found.');
  res.json({ category });
});

const create = asyncHandler(async (req, res) => {
  const payload = validateCategory(req.body);
  const duplicate = await categoryModel.findByName(payload.name);
  if (duplicate) throw new HttpError(409, 'A category with this name already exists.');
  const category = await categoryModel.create(payload);
  res.status(201).json({ category, message: 'Category created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const existing = await categoryModel.findById(id);
  if (!existing) throw new HttpError(404, 'Category not found.');

  const payload = validateCategory(req.body, { partial: true });
  if (payload.name) {
    const duplicate = await categoryModel.findByName(payload.name, id);
    if (duplicate) throw new HttpError(409, 'A category with this name already exists.');
  }
  const category = await categoryModel.update(id, payload);
  res.json({ category, message: 'Category updated successfully.' });
});

const remove = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const category = await categoryModel.findById(id);
  if (!category) throw new HttpError(404, 'Category not found.');

  const taskCount = await categoryModel.countTasks(id);
  if (taskCount > 0) {
    const strategy = req.body?.strategy;
    if (strategy === 'reassign') {
      const reassignTo = positiveId(req.body.reassignTo, 'Reassign category');
      if (reassignTo === id) throw new HttpError(400, 'Choose a different category to reassign tasks to.');
      const target = await categoryModel.findById(reassignTo);
      if (!target) throw new HttpError(400, 'The reassignment category does not exist.');
      await categoryModel.reassignTasks(id, reassignTo);
    } else if (strategy === 'uncategorize') {
      await categoryModel.uncategorizeTasks(id);
    } else {
      throw new HttpError(409, 'This category is assigned to tasks. Reassign the tasks or explicitly move them to Uncategorized before deleting.', {
        requiresReassignment: true,
        taskCount,
      });
    }
  }

  await categoryModel.remove(id);
  res.json({
    message: taskCount > 0
      ? `Category deleted. ${taskCount} task${taskCount === 1 ? ' was' : 's were'} updated.`
      : 'Category deleted successfully.',
  });
});

module.exports = { list, getOne, create, update, remove };
