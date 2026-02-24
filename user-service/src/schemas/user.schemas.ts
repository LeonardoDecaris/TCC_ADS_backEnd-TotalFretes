import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phoneNumber: z.string().min(1),
    cpf: z.string().min(1),
    sex: z.string().min(1),
    useGlasses: z.boolean(),
    isDeficient: z.boolean(),
    cnhNumber: z.string().min(1),
    cnhType_id: z.number(),
    vehicleType_id: z.number(),
    userImage_id: z.number(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phoneNumber: z.string().min(1),
    cpf: z.string().min(1),
    sex: z.string().min(1),
    useGlasses: z.boolean(),
    isDeficient: z.boolean(),
    cnhNumber: z.string().min(1),
    cnhType_id: z.number(),
    vehicleType_id: z.number(),
    userImage_id: z.number(),
});

export const createUserEndAccountSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phoneNumber: z.string().min(1),
    cpf: z.string().min(1),
    sex: z.string().min(1),
    useGlasses: z.boolean(),
    isDeficient: z.boolean(),
    cnhNumber: z.string().min(1),
    cnhType_id: z.number(),
    vehicleType_id: z.number(),
    userImage_id: z.number(),
    password: z.string().min(1),
    account_type_id: z.number(),
}); 
