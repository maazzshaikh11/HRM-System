"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding data...');
    // 1. Roles
    const roles = ['Admin', 'Employee', 'HR'];
    for (const r of roles) {
        await prisma.roles.upsert({
            where: { name: r },
            update: {},
            create: { name: r },
        });
    }
    // 2. Departments
    const departments = ['IT', 'HR', 'Engineering', 'Sales', 'Marketing'];
    for (const d of departments) {
        await prisma.departments.upsert({
            where: { name: d },
            update: {},
            create: { name: d },
        });
    }
    // Find IDs
    const itDept = await prisma.departments.findUnique({ where: { name: 'IT' } });
    const engDept = await prisma.departments.findUnique({ where: { name: 'Engineering' } });
    // 3. Admin User
    const adminId = 'EMP-001';
    await prisma.users.upsert({
        where: { employee_id: adminId },
        update: {},
        create: {
            employee_id: adminId,
            name: 'System Admin',
            email: 'admin@hrms.com',
            password: 'hashed_password_placeholder', // Should be properly hashed
            role: 'Admin',
            department_id: itDept?.id,
            profile: {
                create: {
                    designation: 'System Administrator',
                    joining_date: new Date(),
                }
            },
            salary_structures: {
                create: {
                    basic: 100000,
                    hra: 40000,
                    lta: 10000,
                    pf: 12000,
                    other_allowance: 20000,
                    deductions: 5000,
                }
            }
        },
    });
    // 4. Demo Employee
    const employeeId = 'EMP-002';
    await prisma.users.upsert({
        where: { employee_id: employeeId },
        update: {},
        create: {
            employee_id: employeeId,
            name: 'Demo Employee',
            email: 'demo@hrms.com',
            password: 'hashed_password_placeholder',
            role: 'Employee',
            department_id: engDept?.id,
            profile: {
                create: {
                    designation: 'Software Engineer',
                    joining_date: new Date(),
                }
            },
            salary_structures: {
                create: {
                    basic: 60000,
                    hra: 24000,
                    lta: 6000,
                    pf: 7200,
                    other_allowance: 10000,
                    deductions: 2000,
                }
            }
        },
    });
    console.log('Seeding completed successfully.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
