-- Seed data for Phase 2 demo and development use
insert into public.entities (id, entity_type, entity_name, province, district, municipality, city, postal_code, phone, email, primary_contact_name, primary_contact_phone, primary_contact_email, status)
values
  ('11111111-1111-1111-1111-111111111111', 'school', 'Mokopane Secondary School', 'Limpopo', 'Capricorn', 'Mokopane', 'Mokopane', '0600', '0151234567', 'admin@mokopane.example', 'Mr. M. Mokoena', '0710000001', 'mokoena@example.org', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'warehouse', 'Midrand Distribution Hub', 'Gauteng', 'City of Johannesburg', 'Midrand', 'Midrand', '1685', '0112345678', 'warehouse@ibatur.example', 'A. Pillay', '0820000002', 'pillay@example.org', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'sponsor', 'FirstRand Foundation', 'National', 'National', 'Johannesburg', 'Johannesburg', '2000', '0115555555', 'sponsor@firstrand.example', 'T. Khumalo', '0830000003', 'khumalo@example.org', 'active'),
  ('44444444-4444-4444-4444-444444444444', 'ngo', 'CareerLinx', 'National', 'National', 'Pretoria', 'Pretoria', '0001', '0123334444', 'ops@careerlinx.example', 'L. Dlamini', '0840000004', 'dlamini@example.org', 'active')
on conflict (id) do nothing;

insert into public.schools (id, emis_number, school_type, phase, number_of_learners, number_of_educators, quintile, no_fee_school, language_medium, principal_name, principal_contact, department_region, circuit, last_visit_date, follow_up_required, follow_up_notes)
values
  ('11111111-1111-1111-1111-111111111111', '700111111', 'Secondary', 'FET', 980, 34, 3, true, 'English', 'Ms. S. Nkosi', '0710000001', 'Limpopo North', 'Mokopane', '2026-05-01', true, 'Needs final delivery confirmation')
on conflict (id) do nothing;

insert into public.warehouses (id, warehouse_code, warehouse_tier, storage_capacity_sqm, current_stock_level_ucg_sets, staffing_count, security_features, has_24hr_security, has_cctv, has_dock_levelers, has_fire_suppression, operating_hours, manager_name, manager_phone, manager_email, serving_provinces, serving_districts)
values
  ('22222222-2222-2222-2222-222222222222', 'MID-01', 2, 480.5, 2400, 12, ARRAY['CCTV','Access control','Fire suppression'], true, true, true, true, '{"days": ["Mon","Tue","Wed","Thu","Fri"], "hours": "08:00-18:00"}'::jsonb, 'A. Pillay', '0820000002', 'pillay@example.org', ARRAY['Gauteng','Limpopo'], ARRAY['Johannesburg','Mokopane'])
on conflict (id) do nothing;

insert into public.sponsors (id, sponsor_type, funding_commitment, sponsorship_status, contact_name, contact_email)
values
  ('33333333-3333-3333-3333-333333333333', 'foundation', 2500000.00, 'active', 'T. Khumalo', 'khumalo@example.org')
on conflict (id) do nothing;

insert into public.partner_organizations (id, organization_type, registration_number, service_type, contract_start_date, contract_end_date, contract_value, kpi_targets, current_rating)
values
  ('44444444-4444-4444-4444-444444444444', 'ngo', 'PBO-001', 'training', '2026-01-01', '2026-12-31', 1200000.00, '{"trainers": 150, "schools": 200}'::jsonb, 4.8)
on conflict (id) do nothing;

insert into public.inventory_items (id, warehouse_id, item_type, item_code, quantity_available, quantity_reserved, quantity_dispatched, unit_cost)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'ucg_set', 'UCG-SET-001', 1200, 120, 300, 180.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'training_guide', 'TRAIN-001', 320, 0, 40, 45.00)
on conflict (id) do nothing;

insert into public.shipments (id, shipment_code, sender_warehouse_id, recipient_entity_id, shipment_type, status, dispatched_at, expected_delivery_at, delivered_at, tracking_reference)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'distribution', 'in_transit', '2026-06-18T09:00:00+00:00'::timestamptz, '2026-06-19T12:00:00+00:00'::timestamptz, null, 'TRK-1001'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'distribution', 'planned', '2026-06-20T08:00:00+00:00'::timestamptz, '2026-06-21T10:00:00+00:00'::timestamptz, null, 'TRK-1002')
on conflict (id) do nothing;

insert into public.shipment_items (id, shipment_id, inventory_item_id, quantity, unit_value)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 300, 180.00),
  ('ffffffff-ffffffff-ffffffff-ffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 200, 180.00)
on conflict (id) do nothing;

insert into public.delivery_events (id, shipment_id, event_type, occurred_at, actor_type, actor_name, notes, latitude, longitude)
values
  ('12121212-1212-1212-1212-121212121212', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dispatched', '2026-06-18T09:00:00+00:00'::timestamptz, 'warehouse', 'Midrand Hub', 'Shipment departed from hub', -26.0, 28.0),
  ('13131313-1313-1313-1313-131313131313', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'in_transit', '2026-06-18T14:00:00+00:00'::timestamptz, 'driver', 'Driver 1', 'Crossing provincial checkpoint', -26.2, 28.2)
on conflict (id) do nothing;

insert into public.delivery_confirmations (id, shipment_id, confirmed_by, confirmed_at, proof_photo_url, signature_url, status)
values
  ('14141414-1414-1414-1414-141414141414', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'School official', '2026-06-19T10:00:00+00:00'::timestamptz, 'https://example.com/proof.jpg', 'https://example.com/signature.png', 'pending')
on conflict (id) do nothing;

insert into public.training_sessions (id, organizer_id, session_title, session_type, province, district, venue_name, scheduled_at, status, attendee_count)
values
  ('15151515-1515-1515-1515-151515151515', '44444444-4444-4444-4444-444444444444', 'District Training Launch', 'training', 'Gauteng', 'Johannesburg', 'Midrand Hall', '2026-06-25T09:00:00+00:00'::timestamptz, 'planned', 180)
on conflict (id) do nothing;

insert into public.training_attendees (id, session_id, school_id, trainer_id, attendance_status)
values
  ('16161616-1616-1616-1616-161616161616', '15151515-1515-1515-1515-151515151515', '11111111-1111-1111-1111-111111111111', 'trainer-1', 'registered')
on conflict (id) do nothing;

insert into public.event_programmes (id, sponsor_id, name, start_date, end_date, status)
values
  ('17171717-1717-1717-1717-171717171717', '33333333-3333-3333-3333-333333333333', 'School Launch Programme', '2026-06-01', '2026-08-31', 'active')
on conflict (id) do nothing;

insert into public.project_milestones (id, name, phase, target_date, actual_date, status, owner_entity_id)
values
  ('18181818-1818-1818-1818-181818181818', 'National rollout kickoff', 'phase2', '2026-06-15', '2026-06-12', 'completed', '33333333-3333-3333-3333-333333333333'),
  ('19191919-1919-1919-1919-191919191919', 'Warehouse readiness', 'phase2', '2026-06-22', null, 'in_progress', '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into public.project_kpis (id, metric_name, metric_value, period_start, period_end, entity_id)
values
  ('20202020-2020-2020-2020-202020202020', 'schools_reached', 180.00, '2026-06-01', '2026-06-30', '11111111-1111-1111-1111-111111111111'),
  ('21212121-2121-2121-2121-212121212121', 'shipments_dispatched', 7.00, '2026-06-01', '2026-06-30', '22222222-2222-2222-2222-222222222222')
on conflict (id) do nothing;

insert into public.audit_logs (id, actor_id, action, entity_type, entity_id, metadata)
values
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'created', 'shipment', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"source": "seed"}'::jsonb)
on conflict (id) do nothing;
