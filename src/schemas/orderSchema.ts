import { z } from 'zod';

export const beneficiarySchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  cin: z.string().min(4, "Le CIN est requis"),
});

export const orderSchemaBase = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  cin: z.string().min(4, "Le CIN est requis"),
  isBeninois: z.boolean().default(true),
  idAsebem: z.string().optional(),
  pack: z.enum(['StandardEtudiant', 'StandardProfessionnel', 'VIP']),
  nombrePersonnes: z.number().min(1).max(6),
  beneficiaires: z.array(beneficiarySchema),
});

export const orderSchema = orderSchemaBase.superRefine((data, ctx) => {
  if (data.isBeninois) {
    if (!data.idAsebem || data.idAsebem.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'ID ASEBEM est requis pour les Béninois",
        path: ["idAsebem"],
      });
    } else if (!/^ASEBEM-\d{4}-[A-Z0-9]+$/i.test(data.idAsebem)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format invalide",
        path: ["idAsebem"],
      });
    }
  }
});

export type OrderSchemaType = z.infer<typeof orderSchemaBase>;
