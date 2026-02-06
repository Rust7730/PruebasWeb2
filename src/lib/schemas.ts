import { z } from 'zod';

// VIEW 1: Top Libros
export const MostBorrowedBookSchema = z.object({
  book_id: z.number(),
  title: z.string(),
  author: z.string(),
  category: z.string(),
  total_loans: z.coerce.number(), 
  popularity_rank: z.coerce.number(),
  loan_percentage: z.coerce.number(),
});

// VIEW 2: Préstamos Vencidos
export const OverdueLoanSchema = z.object({
  loan_id: z.number(),
  member_name: z.string(),
  email: z.string().email(),
  book_title: z.string(),
  due_at: z.coerce.date(),
  days_overdue: z.coerce.number(),
  suggested_fine_amount: z.coerce.number(),
});

// VIEW 3: Resumen Multas
export const FinesSummarySchema = z.object({
  month_year: z.string(), // "YYYY-MM"
  total_fines_issued: z.coerce.number(),
  total_collected: z.coerce.number(),
  total_pending: z.coerce.number(),
  collection_rate: z.coerce.number(),
});

// VIEW 4: Actividad Socios
export const MemberActivitySchema = z.object({
  member_id: z.number(),
  name: z.string(),
  email: z.string(),
  total_loans_history: z.coerce.number(),
  current_active_loans: z.coerce.number(),
  late_return_rate: z.coerce.number(),
  member_standing: z.enum(['SUPER_USER', 'RISK', 'NORMAL']),
});

// VIEW 5: Salud Inventario
export const InventoryHealthSchema = z.object({
  category: z.string(),
  total_copies: z.coerce.number(),
  in_shelf: z.coerce.number(),
  loaned_out: z.coerce.number(),
  unavailable: z.coerce.number(),
  availability_percentage: z.coerce.number(),
});

export type MostBorrowedBook = z.infer<typeof MostBorrowedBookSchema>;
export type OverdueLoan = z.infer<typeof OverdueLoanSchema>;
export type FinesSummary = z.infer<typeof FinesSummarySchema>;
export type MemberActivity = z.infer<typeof MemberActivitySchema>;
export type InventoryHealth = z.infer<typeof InventoryHealthSchema>;