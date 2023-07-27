import prisma from "../../utils/prisma";
import { CreateProductInput } from "./product.schema";

export async function createProduct(
  data: CreateProductInput & { ownerId: number }
) {
  return prisma.product.create({
    data,
  });
}

export async function getProducts() {
  return prisma.product.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUniqueOrThrow({
    where: {
      id,
    },
  });
}
