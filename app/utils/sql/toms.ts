import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

let prisma: PrismaClient;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;

// Utility function to handle database queries
export async function handleDatabaseQuery(
  query: (prisma: PrismaClient) => Promise<any>
) {
  try {
    const result = await query(prisma);
    return { status: 200, result };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known request errors from Prisma
      console.error("Known database error:", err);
      return {
        status: 400,
        message: "A known database error occurred",
        code: err.code,
      };
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      // Handle validation errors
      console.error("Validation error:", err);
      return { status: 422, message: "Validation error", details: err.message };
    } else {
      // Handle other errors
      console.error("Unknown database query error:", err);
      return { status: 500, message: "Internal Server Error" };
    }
  }
}

// Example usage in an API route to get data from `ordta_DNCaptured`
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = await handleDatabaseQuery(async (prisma) => {
    return prisma.ordta_DNCaptured.findMany(); // Replace with the desired query
  });

  if ("result" in response) {
    res.status(response.status).json(response.result);
  } else {
    res.status(response.status).json({
      message: response.message,
      ...(response.code && { code: response.code }),
      ...(response.details && { details: response.details }),
    });
  }
}
