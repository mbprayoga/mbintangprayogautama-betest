import { z } from "zod";

export const createUserSchema = z.object({
  userName: z.string().min(1).max(100),
  accountNumber: z.string().min(1).max(50),
  emailAddress: z.string().email(),
  identityNumber: z.string().min(1).max(50),
});

export const updateUserSchema = z
  .object({
    userName: z.string().min(1).max(100).optional(),
    emailAddress: z.string().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
