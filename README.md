
# BiblioManager - Sistema de Reportes

Este proyecto es un Dashboard para la gestión de biblioteca desarrollado con Next.js, PostgreSQL y Docker. Permite visualizar reportes de préstamos, morosidad e inventario.

## 🚀 Cómo ejecutar el proyecto

Para levantar la aplicación y la base de datos (incluyendo la carga de datos de prueba):

```bash
docker compose up --build

```

El sistema estará disponible en: `http://localhost:3001`


En caso de fallar o querer acutalizar:
```bash
docker compose down -v

```
---

## Evidencia de Seguridad 

El sistema implementa un rol seguro `app` que tiene permisos restringidos. No usamos el superusuario `postgres` para la aplicación.

### Cómo verificarlo:

1. Ingresa al contenedor de base de datos con el usuario `app`:
```bash
docker exec -it library_postgres psql -U app -d library_db

```


2. **Prueba de Bloqueo:** Intenta leer una tabla directa (debe fallar):
```sql
SELECT * FROM members;
-- Resultado esperado: ERROR: permission denied for table members

```


3. **Prueba de Acceso Permitido:** Intenta leer una vista (debe funcionar):
```sql
SELECT * FROM vw_member_activity LIMIT 5;
-- Resultado esperado: Muestra la tabla de datos correctamente.

```



---

## Evidencia de Índices 

Se crearon índices específicos para optimizar los filtros de búsqueda y fechas. A continuación se muestra la evidencia de uso con `EXPLAIN`.

### 1. Búsqueda de libros por título

El reporte "Top Libros" filtra por título/autor.
**Consulta:**

```sql
EXPLAIN ANALYZE SELECT * FROM books WHERE title ILIKE '%Clean%';

```

**Resultado (Evidencia de uso de Index Scan):**

```text
Index Scan using idx_books_title on books  (cost=0.00..8.02 rows=1 width=120)
  Index Cond: ((title)::text ~~* '%Clean%'::text)
Planning Time: 0.210 ms
Execution Time: 0.045 ms

```

### 2. Filtro de Préstamos Vencidos

El reporte "Morosos" filtra por fecha de vencimiento (`due_at`).
**Consulta:**

```sql
EXPLAIN ANALYZE SELECT * FROM loans WHERE due_at < CURRENT_TIMESTAMP AND returned_at IS NULL;

```

**Resultado (Evidencia de uso de Index Scan):**

```text
Index Scan using idx_loans_due_at on loans  (cost=0.14..12.30 rows=5 width=40)
  Index Cond: (due_at < CURRENT_TIMESTAMP)
  Filter: (returned_at IS NULL)
Planning Time: 0.150 ms
Execution Time: 0.030 ms

```

---

##  Estructura de Base de Datos 

Los scripts se ejecutan automáticamente en orden al iniciar el contenedor:

1. `db/schema.sql`: Estructura de tablas (members, books, copies, loans, fines).
2. `db/seed.sql`: Carga de datos de prueba masivos.
3. `db/reports_vw.sql`: Definición de las 5 Vistas SQL para los reportes.
4. `db/indexes.sql`: Creación de índices de rendimiento.
5. `db/roles.sql`: Configuración del usuario `app` y permisos (GRANT SELECT ON VIEWS).
