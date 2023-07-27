import { faker } from "@faker-js/faker";
import { test } from "tap";
import buildServer from "../../../server";
import prisma from "../../../utils/prisma";
import { UserType } from "@fastify/jwt";

test("POST `/api/users/login`", async (t) => {
  test("user logged in successfully with correct credentials", async (t) => {
    const server = buildServer();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    t.teardown(async () => {
      server.close();
      await prisma.user.deleteMany({});
    });

    // register user
    await server.inject({
      method: "POST",
      path: "/api/users",
      payload: {
        name,
        email,
        password,
      },
    });

    const response = await server.inject({
      method: "POST",
      path: "/api/users/login",
      payload: {
        email,
        password,
      },
    });

    t.equal(response.statusCode, 200);

    const json = response.json();
    t.hasProp(json, "accessToken");

    // assert jwt data is correct
    const verified = server.jwt.verify<UserType & { iat: number }>( // iat = jwt "issued at time"
      json.accessToken
    );
    t.equal(verified.email, email);
    t.equal(verified.name, name);
    t.type(verified.id, "number");
    t.type(verified.iat, "number");
  });

  test("email and password are not correct", async (t) => {
    const server = buildServer();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();

    t.teardown(async () => {
      server.close();
      await prisma.user.deleteMany({});
    });

    // register user
    await server.inject({
      method: "POST",
      path: "/api/users",
      payload: {
        name,
        email,
        password,
      },
    });

    const response = await server.inject({
      method: "POST",
      path: "/api/users/login",
      payload: {
        email,
        password: "wrong pw this is",
      },
    });

    t.equal(response.statusCode, 401);
    const json = response.json();
    t.equal(json.message, "Invalid email or password");
  });
});
