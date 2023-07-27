import { FastifyInstance } from "fastify";
import {
  getUsersHandler,
  loginHandler,
  registerUserHandler,
} from "./user.controller";
import { $ref } from "./user.schema";

async function userRoutes(server: FastifyInstance) {
  // register new user
  server.post(
    "/",
    {
      schema: {
        // specify the json request body & responses for each status code (this is the json that will be returned). The request is passed through zod which returns only the json fields we specify in user.schema for both body and response.
        body: $ref("createUserSchema"), // i.e. user input should contain email and password
        response: {
          201: $ref("createUserResponseSchema"),
        },
      },
    },
    registerUserHandler
  );

  // login user
  server.post(
    "/login",
    {
      schema: {
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginResponseSchema"),
        },
      },
    },
    loginHandler
  );

  // get a user
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
    },
    getUsersHandler
  );
}

export default userRoutes;
