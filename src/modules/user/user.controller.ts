import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByEmail, findUsers } from "./user.service";
import { CreateUserInput, LoginSchema } from "./user.schema";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";

export async function registerUserHandler(
  request: FastifyRequest<{ Body: CreateUserInput }>,
  reply: FastifyReply
) {
  const { body } = request;
  try {
    const user = await createUser(body);
    return reply.status(201).send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send(error);
  }
}

export async function loginHandler(
  request: FastifyRequest<{ Body: LoginSchema }>,
  reply: FastifyReply
) {
  const { body } = request;

  // ensure user exists
  const user = await findUserByEmail(body.email);
  if (!user) {
    return reply.status(401).send({ message: "Invalid email or password" }); // 401 = invalid auth credentials
  }

  // verify password
  const isPasswordCorrect = await verifyPassword({
    candidatePassword: body.password,
    hash: user.password,
    salt: user.salt,
  });

  if (isPasswordCorrect) {
    // create jwt access token
    const { password, salt, ...rest } = user;
    return { accessToken: request.jwt.sign(rest) };
  }

  return reply.status(401).send({ message: "Invalid email or password" });
}

export async function getUsersHandler() {
  const user = await findUsers();

  return user;
}
