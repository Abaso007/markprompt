-- Tokens - NOT IN USE due to a bug in pgsodium

drop view v_insights_query_stats;

alter table tokens
add column encrypted_value text;

create or replace function public.tokens_encrypt_secret_value() returns "trigger"
    language "plpgsql"
    as $$
    begin
            new.encrypted_value = case when new.encrypted_value is null then null else
      case when '<ENCRYPTION-KEY-ID>' is null then null else pg_catalog.encode(
        pgsodium.crypto_aead_det_encrypt(
        pg_catalog.convert_to(new.encrypted_value, 'utf8'),
        pg_catalog.convert_to(('')::text, 'utf8'),
        '<ENCRYPTION-KEY-ID>'::uuid,
        null
        ),
        'base64') end end;
    return new;
    end;
$$;

alter function public.tokens_encrypt_secret_value() owner to "postgres";

grant all on function public.tokens_encrypt_secret_value() to "anon";
grant all on function public.tokens_encrypt_secret_value() to "authenticated";
grant all on function public.tokens_encrypt_secret_value() to "service_role";

create trigger tokens_encrypt_secret_trigger_value before insert or update of encrypted_value on public.tokens for each row execute function public.tokens_encrypt_secret_value();

create or replace view public.decrypted_tokens as
 select tokens.id,
    tokens.inserted_at,
    tokens.project_id,
    tokens.encrypted_value,
    tokens.created_by,
        case
            when (tokens.encrypted_value is null) then null::"text"
            else
            case
                when ('<ENCRYPTION-KEY-ID>' is null) then null::"text"
                else convert_from(pgsodium.crypto_aead_det_decrypt(decode(tokens.encrypted_value, 'base64'::"text"), convert_to(''::"text", 'utf8'::"name"), '<ENCRYPTION-KEY-ID>'::"uuid", null::"bytea"), 'utf8'::"name")
            end
        end as decrypted_value
   from public.tokens;

alter table public.decrypted_tokens owner to postgres;

security label for pgsodium on column public.tokens.encrypted_value is 'encrypt with key id <ENCRYPTION-KEY-ID> security invoker';

update tokens
set encrypted_value = value

create view v_insights_query_stats as
  select
    qs.id as id,
    qs.conversation_id as conversation_id,
    qs.created_at as created_at,
    qs.project_id as project_id,
    qs.processed_state as processed_state,
    qs.decrypted_prompt as decrypted_prompt,
    qs.no_response as no_response,
    qs.feedback as feedback,
    c.decrypted_metadata::jsonb as decrypted_conversation_metadata
  from decrypted_query_stats qs
  left join decrypted_conversations c on qs.conversation_id = c.id;
