# Sequences

All primary keys in this schema use `GENERATED ALWAYS AS IDENTITY`
(native Oracle 12c+ identity columns), so no separate `CREATE SEQUENCE`
statements are needed for PKs.

If you're targeting an older Oracle version without identity columns,
add classic sequence + trigger pairs here, e.g.:

```sql
CREATE SEQUENCE customer_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER customer_bi
BEFORE INSERT ON customer
FOR EACH ROW
WHEN (NEW.customer_id IS NULL)
BEGIN
  SELECT customer_seq.NEXTVAL INTO :NEW.customer_id FROM dual;
END;
/
```
and repeat for each table, then switch the DDL in `database/tables/`
from `GENERATED ALWAYS AS IDENTITY` to plain `NUMBER`.
