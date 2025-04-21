import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    //Fetch / Strip the Account ID from the Frontend
    const { accountId } = await req.json();

    //Now Find the Account in the database
    const accountHistory = await prisma.transaction.findMany({
      where: { accountId: accountId },
    });

    console.log("Transactions successfully fetched");
    return NextResponse.json(accountHistory);
  } catch (error) {
    console.log("Error Fetching Transactions");
    return NextResponse.json(
      { error: "Internal Server error" },
      { status: 500 }
    );
  }
}
