import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { accountId, amount } = await req.json();

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
    const withdrawalAmount = new Prisma.Decimal(amount); // Ensure amount is a Decimal

    // Check for sufficient balance for withdrawal
    if (currentBalance < withdrawalAmount.toNumber()) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Update the account balance for withdrawal
    const updatedBalance = new Prisma.Decimal(currentBalance).sub(
      withdrawalAmount
    );

    // Update the account
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { balance: updatedBalance },
    });

    // Create the transaction record for withdrawal
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        type: "withdrawal", // Hardcoded to "withdrawal"
        amount: withdrawalAmount,
      },
    });

    return NextResponse.json(
      { success: true, transaction, account: updatedAccount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
