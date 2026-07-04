"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const analytics_routes_1 = __importDefault(require("../modules/analytics/routes/analytics.routes"));
const dashboard_routes_1 = __importDefault(require("../modules/dashboard/routes/dashboard.routes"));
const payroll_routes_1 = __importDefault(require("../modules/payroll/routes/payroll.routes"));
const notifications_routes_1 = __importDefault(require("../modules/notifications/routes/notifications.routes"));
// Mount routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/payroll', payroll_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
