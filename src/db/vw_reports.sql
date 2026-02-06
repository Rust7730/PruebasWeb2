-- ==============================================================================
-- VIEW 1: Ranking de libros más prestados
-- TÉCNICA: Window Function (RANK) + Agregación (COUNT)
-- REQUISITOS: Búsqueda por title/author, Paginación.
-- GRAIN: Un registro por Libro.
-- NO SELECT *: Se especifican columnas explícitas.
-- ==============================================================================
CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT 
    b.id AS book_id,
    b.title,
    b.author,
    b.category,
    COUNT(l.id) AS total_loans,
    RANK() OVER (ORDER BY COUNT(l.id) DESC) as popularity_rank,
    ROUND((COUNT(l.id)::numeric / NULLIF((SELECT COUNT(*) FROM loans), 0) * 100), 2) as loan_percentage
FROM books b
JOIN copies c ON b.id = c.book_id
LEFT JOIN loans l ON c.id = l.copy_id
GROUP BY b.id, b.title, b.author, b.category;

-- ==============================================================================
-- VIEW 2: Préstamos vencidos con cálculo de mora
-- TÉCNICA: CTE (Common Table Expression) + CASE
-- REQUISITOS: Filtro por min_days_atraso.
-- GRAIN: Un registro por Préstamo activo vencido.
-- ==============================================================================
CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH active_loans AS (
    SELECT 
        l.id AS loan_id,
        m.name AS member_name,
        m.email,
        b.title AS book_title,
        l.due_at,
        CURRENT_DATE AS today
    FROM loans l
    JOIN members m ON l.member_id = m.id
    JOIN copies c ON l.copy_id = c.id
    JOIN books b ON c.book_id = b.id
    WHERE l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP
)
SELECT 
    al.loan_id,
    al.member_name,
    al.email,
    al.book_title,
    al.due_at,
    EXTRACT(DAY FROM (al.today - al.due_at))::int AS days_overdue,
    CASE 
        WHEN EXTRACT(DAY FROM (al.today - al.due_at)) <= 3 THEN 5.00
        WHEN EXTRACT(DAY FROM (al.today - al.due_at)) <= 10 THEN 20.00
        ELSE 50.00
    END AS fine_amount
FROM active_loans;