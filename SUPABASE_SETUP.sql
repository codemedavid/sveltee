create table if not exists links (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  text text not null,
  href text not null,
  icon text,
  "order" integer default 0,
  subtext text,
  variant text default 'generic',
  active boolean default true
);

-- Enable RLS
alter table links enable row level security;

-- Policies (Drop and recreate to avoid "already exists" errors)

-- 1. READ: Public (Anon) can read
drop policy if exists "Public links are viewable by everyone" on links;
create policy "Public links are viewable by everyone"
  on links for select
  to anon
  using (true);

-- 2. WRITE: Public (Anon) can write (Since we are using hardcoded client-side auth)
-- WARNING: This effectively makes the table public writable for anyone who knows the API
drop policy if exists "Authenticated users can manage links" on links;
drop policy if exists "Public can manage links" on links;

create policy "Public can manage links"
  on links for all
  to anon
  using (true);

-- SEED DATA
do $$
begin
  if not exists (select 1 from links) then
    insert into links (text, href, icon, "order", variant, subtext, active) values
    ('Price List', '#', '💰', 1, 'verified', 'View our latest prices', true),
    ('WhatsApp', '#', '💬', 2, 'social', 'Chat with us', true),
    ('COA', '#', '📄', 3, 'generic', 'Certificate of Analysis', true),
    ('Instruction & Guides', '#', '📘', 4, 'generic', 'How to use our products', true),
    ('Tiktok', '#', '🎵', 5, 'social', 'Follow us on TikTok', true),
    ('Instagram', '#', '📷', 6, 'social', 'Check our photos', true),
    ('Thread', '#', '🧵', 7, 'social', 'Join the conversation', true);
  end if;
end $$;
