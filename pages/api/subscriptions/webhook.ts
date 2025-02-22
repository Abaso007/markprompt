import { Readable } from 'node:stream';

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

import { stripe } from '@/lib/stripe/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

const allowedMethods = ['POST'];

type Data = string | { error: string } | { received: boolean };

const buffer = async (readable: Readable) => {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

// Admin access to Supabase, bypassing RLS.
const supabaseAdmin = createServiceRoleSupabaseClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    console.error('[STRIPE] Error 405');
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      console.error(
        '[STRIPE] Stop:',
        'sig',
        sig?.slice(0, 5),
        'webhookSecret',
        webhookSecret?.slice(0, 5),
      );
      return res.status(400).send('Invalid signature header');
    }

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (e: any) {
    console.error('[STRIPE] Error', e.message);
    console.error('Subscriptions webhook error:', e.message);
    return res.status(400).send(`Error: ${e.message}`);
  }

  console.debug('[STRIPE] Event', event.type);

  if (relevantEvents.has(event.type)) {
    try {
      // When adding a new event type here, make sure to add them to the
      // Stripe dashboard as well.
      switch (event.type) {
        case 'checkout.session.completed': {
          // When a user subscribes to a plan, attach the associated Stripe
          // customer ID to the team for easy subsequent retrieval.
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (
            checkoutSession.metadata?.appId !==
            process.env.NEXT_PUBLIC_STRIPE_APP_ID
          ) {
            // nothing here yet
          }

          if (!checkoutSession.customer) {
            console.error('[STRIPE] Invalid customer');
            throw new Error('Invalid customer.');
          }

          // Stripe knows the team id as it's been associated to
          // client_reference_id during checkout.
          const teamId = checkoutSession.client_reference_id;

          const subscription = await stripe.subscriptions.retrieve(
            checkoutSession.subscription as string,
          );
          const priceId = subscription.items.data[0].price.id;

          const { error } = await supabaseAdmin
            .from('teams')
            .update({
              stripe_customer_id: checkoutSession.customer.toString(),
              stripe_price_id: priceId,
              billing_cycle_start: new Date().toISOString(),
            })
            .eq('id', teamId);

          if (error) {
            console.error('[STRIPE] Error sessions completed', error.message);
            console.error('Error session completed', error.message);
            throw new Error(
              `Unable to update customer in database: ${error.message}`,
            );
          }
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const newPriceId = subscription.items.data[0].price.id;
          const stripeCustomerId = subscription.customer.toString();
          const { error } = await supabaseAdmin
            .from('teams')
            .update({
              stripe_price_id: newPriceId,
              billing_cycle_start: new Date().toISOString(),
            })
            .eq('stripe_customer_id', stripeCustomerId);
          if (error) {
            console.error('[STRIPE] Error price updated', error.message);
            throw new Error(`Error updating price: ${error.message}`);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const stripeCustomerId = subscription.customer.toString();
          const { error } = await supabaseAdmin
            .from('teams')
            .update({
              stripe_customer_id: null,
              stripe_price_id: null,
              billing_cycle_start: null,
            })
            .eq('stripe_customer_id', stripeCustomerId);
          console.error(
            '[STRIPE] Subscription deleted. Error?',
            error?.message,
          );
          if (error) {
            throw new Error(`Error deleting subscription: ${error.message}`);
          }
          break;
        }
        default:
          throw new Error('Unhandled event.');
      }
    } catch (error) {
      console.error('Subscriptions webhook error:', error);
      return res
        .status(400)
        .send('Subscriptions webhook error. Check the logs.');
    }
  }

  res.status(200).json({ received: true });
}
