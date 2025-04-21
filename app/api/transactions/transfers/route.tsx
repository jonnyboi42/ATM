import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { fromAccountId, toAccountId, amount } = await req.json();

    if (!fromAccountId || !toAccountId || !amount) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: "Cannot transfer to the same account" },
        { status: 400 }
      );
    }

    // Fetch Both Accounts
    const fromAccount = await prisma.account.findUnique({
      where: { id: fromAccountId },
      select: { balance: true },
    });

    const toAccount = await prisma.account.findUnique({
      where: { id: toAccountId },
      select: { balance: true },
    });

    // Ensure both accounts exist
    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: "One or both accounts not found" },
        { status: 404 }
      );
    }

    const transferAmount = new Prisma.Decimal(amount);

    // Check if fromAccount has enough balance
    if (fromAccount.balance.lt(transferAmount)) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Perform the transfer in a transaction
    const transaction = await prisma.$transaction([
      prisma.account.update({
        where: { id: fromAccountId },
        data: { balance: fromAccount.balance.sub(transferAmount) },
      }),
      prisma.account.update({
        where: { id: toAccountId },
        data: { balance: toAccount.balance.add(transferAmount) },
      }),
      prisma.transaction.create({
        data: {
          accountId: fromAccountId,
          type: "transfer-out",
          amount: transferAmount,
        },
      }),
      prisma.transaction.create({
        data: {
          accountId: toAccountId,
          type: "transfer-in",
          amount: transferAmount,
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        fromAccount: transaction[0],
        toAccount: transaction[1],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transfer Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
