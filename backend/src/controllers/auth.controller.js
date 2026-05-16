const prisma = require("../config/database");
const { hashPassword, comparePassword, signToken } = require("../services/auth.service");
const { apiResponse } = require("../utils/apiResponse");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json(apiResponse.error("Email already registered"));

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: { id: true, name: true, email: true },
  });
  const token = signToken({ id: user.id, email: user.email });
  return res.status(201).json(apiResponse.success({ user, token }, "Registered"));
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json(apiResponse.error("Invalid credentials"));

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json(apiResponse.error("Invalid credentials"));

  const token = signToken({ id: user.id, email: user.email });
  return res.json(
    apiResponse.success(
      { user: { id: user.id, name: user.name, email: user.email }, token },
      "Logged in"
    )
  );
};

exports.me = async (req, res) => res.json(apiResponse.success(req.user));
