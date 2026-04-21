-- Add r2_key column to track R2 object keys for deletion
alter table gallery_images add column if not exists r2_key text;
alter table documents add column if not exists r2_key text;
