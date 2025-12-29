import stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    //Use stripeInstance, and 3. Use the correct Webhook Secret
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(`Webhooks Error: ${error.message}`);
    return res.status(400).send(`Webhooks Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      //Use the specific event for Checkout
      case "checkout.session.completed": {
        const session = event.data.object;

        // Ensure passed bookingId in metadata when creating the checkout session
        const {bookingId} = session.metadata;

        if (bookingId) {
          await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            paymentLink: "", // Clear the link so it can't be reused
          });
          console.log(`Booking ${bookingId} marked as paid.`);
        }
        break;
      }

      default:
        console.log("Unhandled event type: ", event.type);
    }
    res.json({received: true});
  } catch (error) {
    console.log("Webhook processing error", error);
    res.status(500).send("Internal Server Error");
  }
};
