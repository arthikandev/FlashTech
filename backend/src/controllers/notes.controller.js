const notesService = require("../services/notes.service");
const { apiResponse } = require("../utils/apiResponse");

exports.list = async (req, res) =>
  res.json(apiResponse.success(await notesService.listForUser(req.user.id)));

exports.get = async (req, res) => {
  const note = await notesService.getById(req.params.id, req.user.id);
  if (!note) return res.status(404).json(apiResponse.error("Note not found"));
  return res.json(apiResponse.success(note));
};

exports.create = async (req, res) =>
  res
    .status(201)
    .json(apiResponse.success(await notesService.create(req.user.id, req.body), "Created"));

exports.update = async (req, res) => {
  const note = await notesService.update(req.params.id, req.user.id, req.body);
  if (!note) return res.status(404).json(apiResponse.error("Note not found"));
  return res.json(apiResponse.success(note, "Updated"));
};

exports.remove = async (req, res) => {
  const note = await notesService.remove(req.params.id, req.user.id);
  if (!note) return res.status(404).json(apiResponse.error("Note not found"));
  return res.json(apiResponse.success({ id: note.id }, "Deleted"));
};
