import { z } from "zod";

// Room code validation (6 alphanumeric characters)
export const roomCodeSchema = z
  .string()
  .length(6, "Room code must be exactly 6 characters")
  .regex(
    /^[A-Z0-9]+$/,
    "Room code must contain only uppercase letters and numbers"
  );

// Room creation schema
export const createRoomSchema = z.object({
  name: z
    .string()
    .max(50, "Room name must be less than 50 characters")
    .optional(),
});

// Join room schema
export const joinRoomSchema = z.object({
  code: roomCodeSchema,
});

// Poll creation schemas
export const pollBaseSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  question: z
    .string()
    .min(1, "Question is required")
    .max(200, "Question must be less than 200 characters"),
});

// Yes/No poll schema
export const yesNoPollSchema = pollBaseSchema.extend({
  type: z.literal("yes_no"),
});

// Rating poll schema
export const ratingPollSchema = pollBaseSchema
  .extend({
    type: z.literal("rating"),
    minRating: z
      .number()
      .int("Minimum rating must be an integer")
      .min(1, "Minimum rating must be at least 1")
      .max(10, "Minimum rating must be at most 10"),
    maxRating: z
      .number()
      .int("Maximum rating must be an integer")
      .min(1, "Maximum rating must be at least 1")
      .max(10, "Maximum rating must be at most 10"),
  })
  .refine((data) => data.maxRating > data.minRating, {
    message: "Maximum rating must be greater than minimum rating",
    path: ["maxRating"],
  });

// Multiple choice option schema
export const multipleChoiceOptionSchema = z.object({
  text: z
    .string()
    .min(1, "Option text is required")
    .max(50, "Option text must be less than 50 characters"),
});

// Multiple choice poll schema
export const multipleChoicePollSchema = pollBaseSchema.extend({
  type: z.literal("multiple_choice"),
  options: z
    .array(multipleChoiceOptionSchema)
    .min(2, "At least 2 options are required")
    .max(5, "Maximum 5 options allowed"),
});

// Union schema for all poll types
export const createPollSchema = z.discriminatedUnion("type", [
  yesNoPollSchema,
  ratingPollSchema,
  multipleChoicePollSchema,
]);

// Vote schemas
export const yesNoVoteSchema = z.object({
  pollId: z.string().uuid("Invalid poll ID"),
  vote: z.boolean(),
});

export const ratingVoteSchema = z.object({
  pollId: z.string().uuid("Invalid poll ID"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(10, "Rating must be at most 10"),
});

export const multipleChoiceVoteSchema = z.object({
  pollId: z.string().uuid("Invalid poll ID"),
  optionIndex: z
    .number()
    .int("Option index must be an integer")
    .min(0, "Invalid option selected"),
});

// Union schema for all vote types
export const voteSchema = z.discriminatedUnion("type", [
  yesNoVoteSchema.extend({ type: z.literal("yes_no") }),
  ratingVoteSchema.extend({ type: z.literal("rating") }),
  multipleChoiceVoteSchema.extend({ type: z.literal("multiple_choice") }),
]);

// Type exports for TypeScript
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type CreatePollInput = z.infer<typeof createPollSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type YesNoPollInput = z.infer<typeof yesNoPollSchema>;
export type RatingPollInput = z.infer<typeof ratingPollSchema>;
export type MultipleChoicePollInput = z.infer<typeof multipleChoicePollSchema>;
