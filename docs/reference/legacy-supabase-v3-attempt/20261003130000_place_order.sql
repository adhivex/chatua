-- Atomic order creation and stock handling (docs/05-DATABASE.md, Rules).
-- Business rules (prices, delivery fee, totals) are computed in TypeScript (src/lib/delivery.ts,
-- src/server/orders.ts); these functions make the write atomic and re-check prices and stock.

alter table public.orders add column stock_released boolean not null default false;

-- p_order: order columns (payment_method, delivery_method, payment_status, subtotal, delivery_fee, total,
--          customer_name, phone, address_type, address_line, city, pincode)
-- p_items: [{ variant_id, product_id, name, size, unit_price, qty }]
create or replace function public.place_order(p_order jsonb, p_items jsonb)
returns table (id uuid, order_number text, access_token text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_order public.orders;
  v_updated int;
  v_price int;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART' using errcode = 'P0001';
  end if;

  -- Decrement stock, only if the price is unchanged and enough is left (row locks serialise buyers).
  for v_item in select * from jsonb_array_elements(p_items) loop
    update public.variants v
       set stock = v.stock - (v_item->>'qty')::int
     where v.id = (v_item->>'variant_id')::uuid
       and v.price = (v_item->>'unit_price')::int
       and v.stock >= (v_item->>'qty')::int;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      select v.price into v_price from public.variants v where v.id = (v_item->>'variant_id')::uuid;
      if v_price is distinct from (v_item->>'unit_price')::int then
        raise exception 'PRICE_CHANGED' using errcode = 'P0001';
      end if;
      raise exception 'OUT_OF_STOCK:%', v_item->>'name' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.orders (
    payment_method, delivery_method, payment_status, subtotal, delivery_fee, total,
    customer_name, phone, address_type, address_line, city, pincode
  ) values (
    (p_order->>'payment_method')::public.payment_method,
    (p_order->>'delivery_method')::public.delivery_method,
    (p_order->>'payment_status')::public.payment_status,
    (p_order->>'subtotal')::int,
    (p_order->>'delivery_fee')::int,
    (p_order->>'total')::int,
    p_order->>'customer_name',
    p_order->>'phone',
    p_order->>'address_type',
    p_order->>'address_line',
    p_order->>'city',
    p_order->>'pincode'
  )
  returning * into v_order;

  insert into public.order_items (order_id, product_id, name, size, unit_price, qty)
  select v_order.id, (i->>'product_id')::uuid, i->>'name', i->>'size', (i->>'unit_price')::int, (i->>'qty')::int
    from jsonb_array_elements(p_items) as i;

  return query select v_order.id, v_order.order_number, v_order.access_token;
end;
$$;

-- Restores stock for an order exactly once (cancellation, failed online payment).
create or replace function public.release_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_released int;
begin
  update public.orders set stock_released = true
   where id = p_order_id and stock_released = false;
  get diagnostics v_released = row_count;
  if v_released = 0 then
    return false;
  end if;
  update public.variants v
     set stock = v.stock + oi.qty
    from public.order_items oi
    join public.products p on p.id = oi.product_id
   where oi.order_id = p_order_id
     and v.product_id = oi.product_id
     and v.size = oi.size;
  return true;
end;
$$;

-- Only the server (service role) may call these.
revoke execute on function public.place_order(jsonb, jsonb) from public, anon, authenticated;

revoke execute on function public.release_order_stock(uuid) from public, anon, authenticated;

grant execute on function public.place_order(jsonb, jsonb) to service_role;

grant execute on function public.release_order_stock(uuid) to service_role;
