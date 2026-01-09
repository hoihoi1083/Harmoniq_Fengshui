import "server-only";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
	console.warn(
		"Warning: STRIPE_SECRET_KEY is not set. Stripe functionality will not work."
	);
}

export const stripe = process.env.STRIPE_SECRET_KEY
	? new Stripe(process.env.STRIPE_SECRET_KEY)
	: null;
