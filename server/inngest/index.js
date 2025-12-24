import {Inngest} from "inngest";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({id: "ticket-booking"});

// 1. Sync User Creation
const syncUserCreation = inngest.createFunction(
  {id: "sync-user-from-clerk"},
  {event: "clerk/user.created"},
  async ({event}) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    await User.create(userData);
  }
);

// 2. Sync User Deletion
const syncUserDeletion = inngest.createFunction(
  {id: "delete-user-with-clerk"},
  {event: "clerk/user.deleted"},
  async ({event}) => {
    const {id} = event.data;
    await User.findByIdAndDelete(id);
  }
);

// 3. Sync User Update
const syncUserUpdate = inngest.createFunction(
  {id: "update-user-from-clerk"},
  {event: "clerk/user.updated"},
  async ({event}) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data;

    const userData = {
      email: email_addresses[0].email_address,
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    // FIX: Add { upsert: true } to handle cases where creation might have failed or lagged
    await User.findByIdAndUpdate(id, userData, {upsert: true});
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdate];
