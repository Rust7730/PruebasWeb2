
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app') THEN
      CREATE ROLE app WITH LOGIN PASSWORD 'secret_app_password';
   END IF;
END
$do$;

GRANT USAGE ON SCHEMA public TO app;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app;

GRANT SELECT ON vw_most_borrowed_books TO app;
GRANT SELECT ON vw_overdue_loans TO app;
GRANT SELECT ON vw_fines_summary TO app;
GRANT SELECT ON vw_member_activity TO app;
GRANT SELECT ON vw_inventory_health TO app;