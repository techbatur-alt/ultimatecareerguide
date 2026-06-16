INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('evolumes', 'evolumes', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can read volumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evolumes');

CREATE POLICY "Admin can upload volumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evolumes');