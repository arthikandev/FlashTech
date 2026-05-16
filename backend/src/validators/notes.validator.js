const { z } = require("zod");

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
});

module.exports = { createNoteSchema, updateNoteSchema };
