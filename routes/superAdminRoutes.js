// superAdminRoute
const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authMiddleware = require('../middleware/authMiddleware');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: SuperAdmin management and dashboard
 */

/**
 * @swagger
 * /api/superadmin/login:
 *   post:
 *     summary: Log in to the SuperAdmin dashboard
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', superAdminController.login);

/**
 * @swagger
 * /api/superadmin/dashboard:
 *   get:
 *     summary: View the SuperAdmin dashboard
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SuperAdmin dashboard data
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authMiddleware.verifyToken, superAdminController.getDashboard);

/**
 * @swagger
 * /api/superadmin/admins:
 *   get:
 *     summary: View and manage all admins
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 *       401:
 *         description: Unauthorized
 */
router.get('/admins', authMiddleware.verifyToken, superAdminController.getAdmins);


/**
 * @swagger
 * /api/superadmin/admin/{id}:
 *   delete:
 *     summary: Delete an admin by ID (SuperAdmin only)
 *     tags: [SuperAdmin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 admin:
 *                   $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/admin/:id', authMiddleware.verifyToken,superAdminController.deleteAdmin);

/**
 * @swagger
 * /api/superadmin/analytics:
 *   get:
 *     summary: View and manage analytics
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', authMiddleware.verifyToken, superAdminController.getAnalytics);
/**
 * @swagger
 * /api/superadmin/words:
 *   post:
 *     summary: Add a new word
 *     tags: [SuperAdmin]
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
 *         description: The word was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Word'
 *       500:
 *         description: Some server error
 */
router.post('/', authMiddleware.verifyToken, superAdminController.addWord);
/**
 * @swagger
 * /api/superadmin/{id}:
 *   put:
 *     summary: Update a word by ID
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The word ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Word'
 *     responses:
 *       200:
 *         description: The word was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Word'
 *       404:
 *         description: The word was not found
 *       500:
 *         description: Some server error
 */
router.put('/:id', authMiddleware.verifyToken,superAdminController.updateWord);

/**
 * @swagger
 * /api/superadmin/{id}:
 *   get:
 *     summary: Get a word by ID
 *     tags: [SuperAdmin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The word ID
 *     responses:
 *       200:
 *         description: The word description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Word'
 *       404:
 *         description: The word was not found
 */
router.get('/:id', superAdminController.getWordById);

// /**
//  * @swagger
//  * /api/superadmin/words:
//  *   get:
//  *     summary: Get All words
//  *     tags: [SuperAdmin]
//  *     responses:
//  *       200:
//  *         description: List of all words
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 $ref: '#/components/schemas/Word'
//  */
// router.get('/', superAdminController.getAllWords);

/**
 * @swagger
 * /api/superadmin/user-requests/{requestId}/approve:
 *   put:
 *     summary: Approve or reject a word request
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the word request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: Approval status of the request
 *               word:
 *                 type: string
 *                 description: The word being approved (if approved)
 *               description:
 *                 type: string
 *                 description: A description or definition of the word (if approved)
 *     responses:
 *       201:
 *         description: Word request approved and saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Word request approved and saved
 *                 savedRequest:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     word:
 *                       type: string
 *                     description:
 *                       type: string
 *                     approvedBy:
 *                       type: integer
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *       200:
 *         description: Word request rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Word request rejected
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Internal server error
 */
router.put('/user-requests/:requestId/approve', verifyToken, superAdminController.approveWordRequest);

/**
 * @swagger
 * /api/superadmin/word/{id}:
 *   delete:
 *     summary: Delete a word by ID 
 *     tags: [SuperAdmin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the word to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Word deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Word deleted successfully
 *       404:
 *         description: Word not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/word/:id', authMiddleware.verifyToken, superAdminController.deleteWord);


 /**
 * @swagger
 * /api/superadmin:
 *   get:
 *     summary: View their own account information
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account information
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware.verifyToken,superAdminController.getAccountInfo);


module.exports = router;
