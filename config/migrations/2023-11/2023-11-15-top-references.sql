-- Update to new data shape

create or replace function query_stats_top_references(
  project_id uuid,
  from_tz timestamptz,
  to_tz timestamptz,
  match_count int
)
returns table (
  title text,
  path text,
  source jsonb,
  occurrences bigint
)
language plpgsql
as $$
begin
  return query
  select
    reference->'file'->>'title' as title,
    reference->'file'->>'path' as path,
    reference->'file'->'source' as source,
    count(*) as occurrences
  from query_stats,
    jsonb_array_elements(meta->'references') as reference
  where
    query_stats.project_id = query_stats_top_references.project_id
    and query_stats.created_at >= query_stats_top_references.from_tz
    and query_stats.created_at <= query_stats_top_references.to_tz
    and reference->'file'->'source'->'data'->>'connectionId' is not null
  group by title, path, source
  order by occurrences desc
  limit query_stats_top_references.match_count;
end;
$$;
