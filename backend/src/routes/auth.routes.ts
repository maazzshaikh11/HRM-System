import { Router } from 'express';
import { login, refresh, logout, me } from '../controllers/authController';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', verifyToken, me);

// Example of admin only route for testing RBAC
router.get('/admin-only', verifyToken, authorizeRoles('Admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

export default router;
