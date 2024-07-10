const express = require('express');
const router = express.Router();
const analyticController = require('../controllers/analyticController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API for fetching analytics
 */

/**
 * @swagger
 * /api/analytics/user-activity:
 *   get:
 *     summary: Get user activity analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 */
router.get('/user-activity', authMiddleware.verifyToken, analyticController.getUserActivity);

/**
 * @swagger
 * /api/analytics/word-analytics:
 *   get:
 *     summary: Get word analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Word analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 */
router.get('/word-analytics', authMiddleware.verifyToken, analyticController.getWordAnalytics);

/**
 * @swagger
 * /api/analytics/user-request-analytics:
 *   get:
 *     summary: Get user request analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User request analytics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 */
router.get('/user-request-analytics', authMiddleware.verifyToken, analyticController.getUserRequestAnalytics);

module.exports = router;
