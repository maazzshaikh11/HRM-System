"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salaryStructureSchema = void 0;
const zod_1 = require("zod");
exports.salaryStructureSchema = zod_1.z.object({
    employee_id: zod_1.z.string().uuid("Invalid employee ID"),
    wage: zod_1.z.number().positive("Wage must be a positive number"),
    basic_pct: zod_1.z.number().min(0).max(100).optional(),
    hra_pct: zod_1.z.number().min(0).max(100).optional(),
    standard_allowance: zod_1.z.number().min(0).optional(),
    performance_bonus_pct: zod_1.z.number().min(0).max(100).optional(),
    lta_pct: zod_1.z.number().min(0).max(100).optional(),
    pf_employee_pct: zod_1.z.number().min(0).max(100).optional(),
    pf_employer_pct: zod_1.z.number().min(0).max(100).optional(),
    professional_tax: zod_1.z.number().min(0).optional(),
});
