import type { Request, Response } from 'express';
import { prisma } from '../db';
import type { TokenPayload } from '../utils/authUtils';

// 1. GET FINANCIAL SUMMARY & CATEGORY BREAKDOWN
export async function getBudgetSummary(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch all transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: { select: { name: true, type: true, monthlyLimit: true } }
      },
      orderBy: { transactionDate: 'desc' }
    });

    // Calculate Total Income & Expenses
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t: any) => {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;

    // Fetch Categories with spending stats
    const categories = await prisma.budgetCategory.findMany({
      where: { userId }
    });

   const categoryStats = categories.map((cat: any) => {

      const catTransactions = transactions.filter((t: any) => t.categoryId === cat.id);
  const spentAmount = catTransactions.reduce((acc: any, t: any) => acc + t.amount, 0);

      return {
        ...cat,
        spentAmount,
        remainingLimit: cat.monthlyLimit > 0 ? cat.monthlyLimit - spentAmount : 0,
        percentUsed: cat.monthlyLimit > 0 ? Math.round((spentAmount / cat.monthlyLimit) * 100) : 0
      };
    });

    res.status(200).json({
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        totalTransactions: transactions.length
      },
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch budget summary' });
  }
}

// 2. GET TRANSACTIONS LIST
export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, categoryId } = req.query;
    const whereClause: any = { userId };

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      whereClause.type = String(type);
    }
    if (categoryId) {
      whereClause.categoryId = String(categoryId);
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, type: true } }
      },
      orderBy: { transactionDate: 'desc' }
    });

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch transactions' });
  }
}

// 3. LOG NEW TRANSACTION (INCOME / EXPENSE)
export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { type, amount, categoryName, description, transactionDate } = req.body;

    if (!type || !amount || !categoryName) {
      res.status(400).json({ error: 'Transaction type, amount, and category name are required.' });
      return;
    }

    // Get or Create Category
    let category = await prisma.budgetCategory.findFirst({
      where: { userId, name: String(categoryName) }
    });

    if (!category) {
      category = await prisma.budgetCategory.create({
        data: {
          userId,
          name: String(categoryName),
          type: String(type) as any,
          monthlyLimit: 100.00
        }
      });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId: category.id,
        type: String(type) as any,
        amount: Number(amount),
        description: description || '',
        transactionDate: transactionDate ? new Date(transactionDate) : new Date()
      },
      include: {
        category: { select: { name: true, type: true } }
      }
    });

    res.status(201).json({ message: 'Transaction logged successfully!', transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to log transaction' });
  }
}

// 4. DELETE TRANSACTION
export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as Request & { user?: TokenPayload }).user?.userId;
    const transactionId = String(req.params.id);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!existingTransaction) {
      res.status(404).json({ error: 'Transaction not found or access denied.' });
      return;
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    });

    res.status(200).json({ message: 'Transaction deleted successfully!' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete transaction' });
  }
}