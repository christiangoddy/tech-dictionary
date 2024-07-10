const express = require('express');
const router = express.Router();
const generalUserController = require('../controllers/generalUserController');
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware


/**
 * @swagger
 * tags:
 *   name: General Users
 *   description: API for general users
 */

/**
 * @swagger
 * /api/words/search:
 *   get:
 *     summary: Search for words
 *     tags: [General Users]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query string
 *     responses:
 *       200:
 *         description: Successfully retrieved matching words
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Word'
 *       500:
 *         description: Internal server error
 */
router.get('/words/search', generalUserController.searchWords);


/**
 * @swagger
 * /api/users/requests:
 *   get:
 *     summary: View the status of their requests
 *     tags: [General Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved request status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRequest'
 *       500:
 *         description: Internal server error
 */
router.get('/users/requests', generalUserController.getRequestStatus);

/**
 * @swagger
 * /api/recently-added:
 *   get:
 *     summary: Get the top 3 recently added words
 *     tags: [General Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved the recently added words
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Word'
 *       500:
 *         description: Internal server error
 */
router.get('/recently-added', generalUserController.getRecentlyAddedWords);

/**
 * @swagger
 * /api/words/{id}:
 *   get:
 *     summary: Get details of a specific word
 *     tags: [General Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The word ID
 *     responses:
 *       200:
 *         description: Successfully retrieved the word details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Word'
 *       404:
 *         description: Word not found
 *       500:
 *         description: Internal server error
 */
router.get('/words/:id', generalUserController.getWordDetails);

/**
 * @swagger
 * /api/users/request-change:
 *   post:
 *     summary: Request change to word information
 *     tags: [General Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *                 description: The word for which the change is requested
 *               sectionToUpdate:
 *                 type: string
 *                 description: Brief info about the section that needs update
 *     responses:
 *       201:
 *         description: Request submitted successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/users/request-change', generalUserController.requestChangeToWord);


/**
 * @swagger
 * /api/request:
 *   post:
 *     summary: Request a new word to be added to the dictionary.
 *     tags: [General Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *               - description
 *             properties:
 *               word:
 *                 type: string
 *                 description: The word to be added to the dictionary.
 *               description:
 *                 type: string
 *                 description: Description or definition of the word.
 *               requested_by:
 *                 type: string
 *                 description: Identifier of the user requesting the word.
 *     responses:
 *       '201':
 *         description: Word request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Word request submitted successfully
 *                 request:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     word:
 *                       type: string
 *                     description:
 *                       type: string
 *                     requested_by:
 *                       type: string
 *       '500':
 *         description: Failed to submit word request.
 */
router.post('/request',generalUserController.requestNewWord);

/**
 * @swagger
 * /api/word-of-the-day:
 *   get:
 *     summary: Get the word of the day
 *     tags: [General Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved the word of the day
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 term:
 *                   type: string
 *                 class:
 *                   type: string
 *                 meaning:
 *                   type: string
 *                 pronunciation:
 *                   type: string
 *                 history:
 *                   type: string
 *                 example:
 *                   type: string
 *       404:
 *         description: Word of the day not found
 *       500:
 *         description: Internal server error
 */
router.get('/word-of-the-day', generalUserController.getWordOfTheDay);

/**
 * @swagger
 * /api/top-lookups:
 *   get:
 *     summary: Get the top 3 most searched words
 *     tags: [General Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved the top lookups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Word'
 *       500:
 *         description: Internal server error
 */
router.get('/top-lookups', generalUserController.getTopLookups);



module.exports = router;
