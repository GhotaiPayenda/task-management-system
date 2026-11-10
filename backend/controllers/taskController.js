const taskModel = require('../models/taskModel');
const categoryModel = require('../models/categoryModel');
const { validateTask, parseTaskFilters, positiveId } = require('../utils/validators');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

async function assertCategoryExists(categoryId) {
  if (categoryId === null) return;
  const category = await categoryModel.findById(categoryId);
  if (!category) throw new HttpError(400, 'The selected category does not exist.');
}

const list = asyncHandler(async (req, res) => {
  const filters = parseTaskFilters(req.query);
  const result = await taskModel.findAll(filters);
  res.json(result);
});

const getOne = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const task = await taskModel.findById(id);
  if (!task) throw new HttpError(404, 'Task not found.');
  res.json({ task });
});

const create = asyncHandler(async (req, res) => {
  const payload = validateTask(req.body);
  await assertCategoryExists(payload.categoryId);
  const task = await taskModel.create(payload);
  res.status(201).json({ task, message: 'Task created successfully.' });
});

const update = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const existing = await taskModel.findById(id);
  if (!existing) throw new HttpError(404, 'Task not found.');

  const payload = validateTask(req.body, { partial: true });
  if (payload.categoryId !== undefined) await assertCategoryExists(payload.categoryId);

  const task = await taskModel.update(id, payload);
  res.json({ task, message: 'Task updated successfully.' });
});

const updateStatus = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const existing = await taskModel.findById(id);
  if (!existing) throw new HttpError(404, 'Task not found.');
  const payload = validateTask({ status: req.body.status }, { partial: true });
  const task = await taskModel.update(id, payload);
  res.json({ task, message: `Task marked as ${task.status}.` });
});

const remove = asyncHandler(async (req, res) => {
  const id = positiveId(req.params.id);
  const deleted = await taskModel.remove(id);
  if (!deleted) throw new HttpError(404, 'Task not found.');
  res.json({ message: 'Task deleted successfully.' });
});

module.exports = { list, getOne, create, update, updateStatus, remove };
