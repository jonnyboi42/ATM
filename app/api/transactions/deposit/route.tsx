import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { accountId, amount } = await req.json(); // Removing 'type' as it is no longer needed here

    if (!accountId || !amount) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch the account
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const currentBalance = account.balance.toNumber(); // Convert Prisma Decimal to number
    const depositAmount = new Prisma.Decimal(amount); // Ensure amount is a Decimal

    // Update the account balance using Decimal for deposit
    const updatedBalance = new Prisma.Decimal(currentBalance).add(
      depositAmount
    );

    // Update the account
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { balance: updatedBalance },
    });

    // Create the transaction record for deposit
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        type: "deposit", // Hardcoded to "deposit" as we're focusing on deposits only
        amount: depositAmount,
      },
    });

    return NextResponse.json(
      { success: true, transaction, account: updatedAccount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deposit Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
