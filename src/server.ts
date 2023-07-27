import dotenv from "dotenv";
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt, { JWT } from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { userSchemas } from "./modules/user/user.schema";
import { productSchemas } from "./modules/product/product.schema";
import userRoutes from "./modules/user/user.route";
import { productRoutes } from "./modules/product/product.route";

// https://www.typescriptlang.org/docs/handbook/modules.html#working-with-other-javascript-libraries
declare module "fastify" {
  export interface FastifyInstance {
    authenticate: any; // add the authenticate type to FastifyInstance globally
  }
  export interface FastifyRequest {
    jwt: JWT; // add jwt interface to the request object so TypeScript doesn't complain that it doesn't exist
  }
}

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    user: {
      id: number;
      email: string;
      name: string;
    };
  }
}

function buildServer() {
  const server = Fastify();

  // register jwt plugin and secret
  server.register(fastifyJwt, { secret: process.env.JWT_SECRET as string });
  // create Swagger API docs at path ${host}/documentation
  server.register(swagger);
  server.register(swaggerUI, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
  });

  // by default, the fastify jwt plugin attaches the jwt module to the server instance, but for convenvenience we'll also make it available from the fastify request object
  server.addHook("preHandler", (req, reply, next) => {
    req.jwt = server.jwt;
    return next();
  });

  // adds a JSON schema to the Fastify instance. This allows you to reuse it everywhere in your application just by using the standard $ref keyword.
  for (const schema of [...userSchemas, ...productSchemas]) {
    server.addSchema(schema);
  }
  // register routes
  server.register(userRoutes, { prefix: "api/users" });
  server.register(productRoutes, { prefix: "api/products" });

  // "decorate" the fastify instance with an authenticate method
  server.decorate(
    "authenticate",
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await req.jwtVerify();
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  // can use this endpoint to ping the server to ensure it's running at all times
  server.get("/healthcheck", async function (req, res) {
    return { status: "OK" };
  });

  return server;
}

export default buildServer;
