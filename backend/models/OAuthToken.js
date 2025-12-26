import mongoose from "mongoose";

const OAuthTokenSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["microsoft"],
      unique: true,
      required: true,
    },

    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },

    scope: String,
    token_type: String,

    expires_at: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OAuthToken", OAuthTokenSchema);