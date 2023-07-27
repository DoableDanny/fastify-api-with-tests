import { faker } from "@faker-js/faker";
import { test } from "tap";
import buildServer from "../../../server";
import { ImportMock } from "ts-mock-imports";
import * as userService from "../user.service";
import prisma from "../../../utils/prisma";

test("POST `/api/users` - create user successfully with mock createUser", async (t) => {
  const name = faker.person.fullName();
  const email = faker.internet.email();
  const password = faker.internet.password();
  const id = Math.floor(Math.random() * 1_000);

  const server = buildServer();

  // create a "stub" version of createUser(). This means that we won't actually run this function's logic when running the test (making a POST request to create a user), as it returns the following predetermined values. This means the test can run without depending on connecting with a database.
  const stub = ImportMock.mockFunction(userService, "createUser", {
    name,
    email,
    id,
  });

  t.teardown(() => {
    stub.restore(); // restore the original function so it doesn't mess up other tests
    server.close();
  });

  const response = await server.inject({
    method: "POST",
    path: "/api/users",
    body: {
      name,
      email,
      password,
    },
  });

  t.equal(response.statusCode, 201);
  t.equal(response.headers["content-type"], "application/json; charset=utf-8");

  const json = response.json();
  t.equal(json.name, name);
  t.equal(json.email, email);
  t.equal(json.id, id);
});

test("POST `/api/users` - create user successfully with test database", async (t) => {
  const name = faker.person.fullName();
  const email = faker.internet.email();
  const password = faker.internet.password();
  const id = Math.floor(Math.random() * 1_000);

  const server = buildServer();

  t.teardown(async () => {
    server.close();
    await prisma.user.deleteMany({}); // refresh the users table once test complete
  });

  const response = await server.inject({
    method: "POST",
    path: "/api/users",
    payload: {
      name,
      email,
      password,
    },
  });

  t.equal(response.statusCode, 201);
  t.equal(response.headers["content-type"], "application/json; charset=utf-8");

  const json = response.json();
  t.equal(json.name, name);
  t.equal(json.email, email);
  t.type(json.id, "number");
});

test("POST `/api/users` - fail to create a user", async (t) => {
  // Arrange
  const server = buildServer();
  const name = faker.person.fullName();
  const password = faker.internet.password();
  t.teardown(() => {
    // at test completion:
    server.close();
    prisma.user.deleteMany({});
  });

  // Act
  const response = await server.inject({
    method: "POST",
    path: "/api/users",
    payload: {
      name,
      password,
    },
  });

  // Assert
  t.equal(response.statusCode, 400);

  const json = response.json();
  t.equal(json.message, "body must have required property 'email'");
});
