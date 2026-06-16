CREATE POLICY "Agent activate self" ON public.sales_agents
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());