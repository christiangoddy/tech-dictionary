const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
require('../middleware/authMiddleware');
const UserRequest = require('../models/UserRequest');
const superAdminController = require('../controllers/superAdminController');
const { sendInvitation } = require('../controllers/superAdminController');


/**
 * @swagger
 * tags:
 *   name: Admins
 *   description: API for admins
 */
/**
 * @swagger
 * /admin/register-admin:
 *   post:
 *     summary: Register a new admin using an invitation token
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123token
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Error registering admin
 */
router.post('/register-admin', superAdminController.registerAdmin);

/**
 * @swagger
 * /api/superadmin/send-invitation:
 *   post:
 *     summary: Send an invitation to a user to become an admin
 *     tags: [SuperAdmin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       500:
 *         description: Error sending invitation
 */
router.post('/send-invitation', superAdminController.sendInvitation);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Log in to their own admin dashboard
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', adminController.login);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: View their own admin dashboard
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authMiddleware.verifyToken, adminController.getDashboard);

/**
 * @swagger
 * /admin/words:
 *   get:
 *     summary: View and manage words in their own dashboard
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of words
 *       401:
 *         description: Unauthorized
 */
router.get('/words', authMiddleware.verifyToken,adminController.getWords);

/**
 * @swagger
 * /admin/words:
 *   post:
 *     summary: Add new words
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Word'
 *     responses:
 *       201:
 *         description: Word added successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/words', authMiddleware.verifyToken, adminController.addWord);

/**
 * @swagger
 * /admin/words/{id}:
 *   put:
 *     summary: Edit existing words
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Word ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Word'
 *     responses:
 *       200:
 *         description: Word updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Word not found
 */
router.put('/words/:id', authMiddleware.verifyToken, adminController.editWord);

/**
 * @swagger
 * /admin/words/{id}:
 *   delete:
 *     summary: Delete words
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Word ID
 *     responses:
 *       200:
 *         description: Word deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Word not found
 */
router.delete('/words/:id', authMiddleware.verifyToken, adminController.deleteWord);

/**
 * @swagger
 * /admin/requests:
 *   get:
 *     summary: Retrieve all user requests for new words.
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of all user requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Auto-incrementing unique identifier for each request.
 *                   word:
 *                     type: string
 *                     description: The word being requested.
 *                   description:
 *                     type: string
 *                     description: Description or definition of the word.
 *                   requested_by:
 *                     type: string
 *                     description: Identifier of the user who made the request.
 *                   requested_at:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the request was made.
 *                   approved:
 *                     type: boolean
 *                     description: Indicates whether the request has been approved.
 *                   approved_by:
 *                     type: string
 *                     description: Identifier of the admin or superadmin who approved the request.
 *                   approved_at:
 *                     type: string
 *                     format: date-time
 *                     description: Timestamp when the request was approved.
 *       '500':
 *         description: Failed to fetch user requests.
 */
router.get('/requests',authMiddleware.verifyToken,  adminController.getUserRequests);

/**
 * @swagger
 * /admin/requests/{id}:
 *   put:
 *     summary: Update the status of a request
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status of the request
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 */
router.put('/requests/:id', authMiddleware.verifyToken,adminController.updateRequestStatus);

/**
 * @swagger
 * /admin/account:
 *   get:
 *     summary: View their own account information
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account information
 *       401:
 *         description: Unauthorized
 */
router.get('/account', authMiddleware.verifyToken,adminController.getAccountInfo);


module.exports = router;
