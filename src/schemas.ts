import { z } from "zod";

export const transportationModeSchema = z.object({
    mode_name: z.string().min(1, "Mode name is required"),
    description: z.string().optional(),
    capacity_kg: z.number().positive("Capacity must be positive"),
    base_price: z.number().positive("Base price must be positive"),
    price_per_km: z.number().positive("Price per km must be positive")
});

export const cargoTypeSchema = z.object({
    type_name: z.string().min(1, "Type name is required"),
    description: z.string().optional(),
    handling_instructions: z.string().optional(),
    price_multiplier: z.number().positive("Price multiplier must be positive").default(1.0)
});

export const facilitySchema = z.object({
    name: z.string().min(1, "Facility name is required"),
    description: z.string().optional()
});