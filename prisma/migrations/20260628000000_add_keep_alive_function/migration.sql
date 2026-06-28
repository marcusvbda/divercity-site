create or replace function keep_alive()
returns int
language sql
as $$
  select 1;
$$;
