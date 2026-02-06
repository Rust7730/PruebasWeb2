import { query } from './db'; 
import { z } from 'zod';
import { 
  MostBorrowedBookSchema, 
  OverdueLoanSchema, 
  FinesSummarySchema, 
  MemberActivitySchema, 
  InventoryHealthSchema 
} from './schemas';

export async function getMostBorrowedBooks(search: string = '', page: number = 1) {
  const ITEMS_PER_PAGE = 5; 
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    const result = await query(
      `SELECT * FROM vw_most_borrowed_books 
       WHERE title ILIKE $1 OR author ILIKE $1
       ORDER BY popularity_rank ASC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, ITEMS_PER_PAGE, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM vw_most_borrowed_books WHERE title ILIKE $1 OR author ILIKE $1`,
      [`%${search}%`]
    );
    
    const data = z.array(MostBorrowedBookSchema).parse(result.rows);
    const totalItems = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return { data, totalPages, totalItems, error: null };
  } catch (err) {
    console.error("Database Error:", err);
    return { data: [], totalPages: 0, totalItems: 0, error: "Error al cargar libros." };
  }
}
export async function getOverdueLoans(minDays: number = 0, page: number = 1) {
  const ITEMS_PER_PAGE = 5;
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const safeMinDays = isNaN(minDays) || minDays < 0 ? 0 : minDays;

  try {
    const result = await query(
      `SELECT * FROM vw_overdue_loans 
       WHERE days_overdue >= $1
       ORDER BY days_overdue DESC
       LIMIT $2 OFFSET $3`,
      [safeMinDays, ITEMS_PER_PAGE, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM vw_overdue_loans WHERE days_overdue >= $1`,
      [safeMinDays]
    );

    const data = z.array(OverdueLoanSchema).parse(result.rows);
    const totalItems = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return { data, totalPages, totalItems, error: null };
  } catch (err) {
    console.error(err);
    return { data: [], totalPages: 0, totalItems: 0, error: "Error al cargar morosos." };
  }
}

export async function getFinesSummary(startDate?: string, endDate?: string) {
  try {

    const dateRegex = /^\d{4}-\d{2}$/;
    const safeStart = startDate && dateRegex.test(startDate) ? startDate : '2000-01';
    const safeEnd = endDate && dateRegex.test(endDate) ? endDate : '2099-12';

    const result = await query(
      `SELECT * FROM vw_fines_summary 
       WHERE month_year >= $1 AND month_year <= $2
       ORDER BY month_year DESC`,
      [safeStart, safeEnd]
    );

    const data = z.array(FinesSummarySchema).parse(result.rows);
    return { data, error: null };
  } catch (err) {
    return { data: [], error: "Error al cargar multas." };
  }
}

export async function getMemberActivity() {
  try {
    const result = await query('SELECT * FROM vw_member_activity ORDER BY late_return_rate DESC');
    const data = z.array(MemberActivitySchema).parse(result.rows);
    return { data, error: null };
  } catch (err) {
    return { data: [], error: "Error al cargar socios." };
  } 
}
