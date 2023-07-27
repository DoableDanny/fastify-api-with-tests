import { FastifyReply, FastifyRequest } from "fastify";
import { createProduct, getProductById, getProducts } from "./product.service";
import { CreateProductInput } from "./product.schema";

export async function getProductsHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const products = await getProducts();
  return products;
}

export async function createProductHandler(
  req: FastifyRequest<{ Body: CreateProductInput }>,
  reply: FastifyReply
) {
  const body = req.body;
  try {
    const product = await createProduct({ ...body, ownerId: req.user.id });
    return product;
  } catch (error) {
    return reply.code(500).send("Failed to create product");
  }
}

export async function getProductByIdHandler(
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const id = parseInt(req.params.id);

  try {
    const product = await getProductById(id);
    return product;
  } catch (error) {
    return reply.status(404).send({ message: "Failed to get that product" });
  }
}
