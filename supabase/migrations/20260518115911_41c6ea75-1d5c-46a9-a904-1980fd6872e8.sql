
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE CHECK (tracking_number ~ '^[0-9]{16}$'),
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  package_description TEXT,
  shipment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  estimated_delivery_date DATE NOT NULL,
  processing_done BOOLEAN NOT NULL DEFAULT true,
  processing_at TIMESTAMPTZ DEFAULT now(),
  processing_location TEXT,
  picked_up_done BOOLEAN NOT NULL DEFAULT false,
  picked_up_at TIMESTAMPTZ,
  picked_up_location TEXT,
  in_transit_done BOOLEAN NOT NULL DEFAULT false,
  in_transit_at TIMESTAMPTZ,
  in_transit_location TEXT,
  out_for_delivery_done BOOLEAN NOT NULL DEFAULT false,
  out_for_delivery_at TIMESTAMPTZ,
  out_for_delivery_location TEXT,
  delivered_done BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMPTZ,
  delivered_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX shipments_tracking_idx ON public.shipments (tracking_number);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view shipments"
  ON public.shipments FOR SELECT
  USING (true);

CREATE POLICY "Public can insert shipments"
  ON public.shipments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update shipments"
  ON public.shipments FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "Public can delete shipments"
  ON public.shipments FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shipments_set_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
