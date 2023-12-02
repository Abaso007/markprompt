create or replace function get_files(
  q_project_id uuid,
  q_order_by_column text,
  q_order_by_direction text,
  q_limit int,
  q_offset int,
  q_source_ids uuid[]
)
returns table (
    id bigint,
    path text,
    meta jsonb,
    title text,
    project_id uuid,
    updated_at timestamp with time zone,
    source_id uuid,
    checksum text,
    token_count int,
    internal_metadata jsonb
) as $$
declare
  source_id_filter text;
begin
  if q_source_ids is not null and array_length(q_source_ids, 1) > 0 then
      source_id_filter := 'and sources.id = any($4) ';
  else
      source_id_filter := '';
  end if;

  return query
  execute
  'select files.id, path, meta, coalesce(files.meta->>''title'',path) as title, files.project_id, files.updated_at, source_id, checksum, token_count, internal_metadata
  from files
  inner join sources
  on sources.id = files.source_id
  where sources.project_id = $1 ' || source_id_filter ||
  'order by ' || q_order_by_column || ' ' ||
    (case when q_order_by_direction = 'asc' then 'asc' else 'desc' end) || ' ' ||
  'limit $2 offset $3'
  using q_project_id, q_limit, q_offset, q_source_ids;
end;
$$ language plpgsql;
