const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');
const authMiddleware = require('../middleware/authMiddleware');


/**
 * @swagger
 * tags:
 *   name: Words
 *   description: API for managing words
 */

/**
 * @swagger
 * /words:
 *   get:
 *     summary: Get All words
 *     tags: [Words]
 *     responses:
 *       200:
 *         description: List of all words
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Word'
 */
router.get('/', wordController.getAllWords);

/**
 * @swagger
 * /words:
 *   post:
 *     summary: Add a new word
 *     tags: [Words]
 
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
router.post('/',  wordController.addWord);

/**
 * @swagger
 * /words/{id}:
 *   get:
 *     summary: Get a word by ID
 *     tags: [Words]
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
router.get('/:id', wordController.getWordById);


/**
 * @swagger
 * /words/{id}:
 *   put:
 *     summary: Update a word by ID
 *     tags: [Words]
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
router.put('/:id', wordController.updateWord);

/**
 * @swagger
 * /words/{id}:
 *   delete:
 *     summary: Delete a word by ID
 *     tags: [Words]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The word ID
 *     responses:
 *       200:
 *         description: The word was deleted
 *       404:
 *         description: The word was not found
 *       500:
 *         description: Some server error
 */
router.delete('/:id',  wordController.deleteWord);

module.exports = router;
