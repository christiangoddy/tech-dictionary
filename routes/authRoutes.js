//authRoutes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../tech-dictionary/middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for authentication
 */


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user (admin or superAdmin)
 *     description: Authenticate user and return JWT token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out user
 *     description: Logs out the currently authenticated user by invalidating their token.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized, invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;
