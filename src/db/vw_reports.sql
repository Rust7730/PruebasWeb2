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

-- ==============================================================================
-- VIEW 3: Resumen mensual de multas
-- TÉCNICA: HAVING + Agregación (SUM) + COALESCE
-- REQUISITOS: Filtro por rango de fechas.
-- GRAIN: Un registro por Mes/Año.
-- ==============================================================================
CREATE OR REPLACE VIEW vw_fines_summary AS
SELECT 
    TO_CHAR(l.loaned_at, 'YYYY-MM') AS month_year,
    COUNT(f.id) AS total_fines_issued,
    COALESCE(SUM(CASE WHEN f.status = 'PAID' THEN f.amount END), 0) AS total_collected,
    COALESCE(SUM(CASE WHEN f.status = 'PENDING' THEN f.amount END), 0) AS total_pending,
    ROUND(
        COALESCE(SUM(CASE WHEN f.status = 'PAID' THEN f.amount END), 0) / 
        NULLIF(SUM(f.amount), 0) * 100, 
    2) as collection_rate
FROM fines f
JOIN loans l ON f.loan_id = l.id
GROUP BY TO_CHAR(l.loaned_at, 'YYYY-MM')
HAVING SUM(f.amount) > 0;

-- ==============================================================================
-- VIEW 4: Actividad de Socios y Riesgo
-- TÉCNICA: HAVING + CASE + Agregación Compleja
-- REQUISITOS: Identificar socios activos.
-- GRAIN: Un registro por Socio.
-- NO SELECT *: Alias explícitos.
-- ==============================================================================
CREATE OR REPLACE VIEW vw_member_activity AS
SELECT 
    m.id AS member_id,
    m.name,
    m.email,
    COUNT(l.id) AS total_loans_history,
    COUNT(CASE WHEN l.returned_at IS NULL THEN 1 END) AS current_active_loans,
    ROUND(
        COUNT(CASE WHEN l.returned_at > l.due_at THEN 1 END)::numeric / 
        NULLIF(COUNT(l.id), 0) * 100, 
    1) AS late_return_rate,
    CASE 
        WHEN COUNT(l.id) > 20 AND COUNT(CASE WHEN l.returned_at > l.due_at THEN 1 END) = 0 THEN 'SUPER_USER'
        WHEN COUNT(CASE WHEN l.returned_at > l.due_at THEN 1 END)::numeric / NULLIF(COUNT(l.id), 0) > 0.5 THEN 'RISK'
        ELSE 'NORMAL'
    END AS member_standing
FROM members m
LEFT JOIN loans l ON m.id = l.member_id
GROUP BY m.id, m.name, m.email
HAVING COUNT(l.id) > 0;