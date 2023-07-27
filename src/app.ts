import buildServer from "./server";

export const server = buildServer();

async function main() {
  try {
    const PORT = 3000;
    await server.listen({ port: 3000 });
    console.log("Server listening on port " + PORT);
  } catch (error) {
    console.error(error);
    process.exit(1); // 1 = failure status code
  }
}

main();
