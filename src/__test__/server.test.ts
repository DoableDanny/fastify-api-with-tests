import { test } from "tap";
import buildServer from "../server";

test("Some test", async (t) => {
  const server = buildServer();
  t.teardown(() => server.close()); // once tests are done, destroy this fastify server instance

  // "Inject" a fake http request
  const response = await server.inject({
    method: "GET",
    path: "/healthcheck",
  });

  t.equal(response.statusCode, 200);
  t.same(response.json(), { status: "OK" });
});
