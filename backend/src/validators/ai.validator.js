const { z } = require("zod");

const aiBodySchema = z.object({
  noteId: z.string().min(1),
});

module.exports = { aiBodySchema };
