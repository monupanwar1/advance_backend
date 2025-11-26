// index.js
import compression from 'compression';
import express from 'express';
import { body, param, validationResult } from 'express-validator';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 3500;

// ----------------------------------------------------
// Middlewares
// ----------------------------------------------------
app.use(express.json());
app.use(compression());

app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=60');
  }
  next();
});

// ----------------------------------------------------
// In memory data
// ----------------------------------------------------
let users = [];

// ----------------------------------------------------
// Swagger Options
// ----------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User CRUD API',
      version: '1.0.0',
      description: 'API documentation for User CRUD operations',
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
      },
    ],
  },
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------------------------------------------------
// Router
// ----------------------------------------------------
const router = express.Router();

// ----------------------------------------------------
// Swagger Components (Schemas + Responses)
// ----------------------------------------------------
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           example: "1732368273623"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           example: "john@example.com"
 *
 *   responses:
 *     NotFound:
 *       description: User not found
 *     BadRequest:
 *       description: Invalid request data
 */

// ----------------------------------------------------
// GET ALL USERS
// ----------------------------------------------------
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Returns all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *             example:
 *               - id: "1732368273623"
 *                 name: "Alice"
 *                 email: "alice@example.com"
 *               - id: "1732368273624"
 *                 name: "Bob"
 *                 email: "bob@example.com"
 */
router.get('/users', (req, res) => {
  res.json(users);
});

// ----------------------------------------------------
// GET USER BY ID
// ----------------------------------------------------
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 */
router.get(
  '/users/:id',
  [param('id').notEmpty().withMessage('user id is required')],
  (req, res) => {
    const { id } = req.params;
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'User not found',
        statusCode: 404,
      });
    }

    res.json(user);
  },
);

// ----------------------------------------------------
// CREATE USER
// ----------------------------------------------------
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rohan"
 *               email:
 *                 type: string
 *                 example: "rohan@example.com"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 */
router.post(
  '/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email is required'),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: error.array(),
        statusCode: 400,
      });
    }

    const { name, email } = req.body;

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
    };

    users.push(newUser);

    res.status(201).json(newUser);
  },
);

// ----------------------------------------------------
// UPDATE USER
// ----------------------------------------------------
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: "Updated Name"
 *               email: "updated@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         $ref: "#/components/responses/NotFound"
 */
router.put(
  '/users/:id',
  [
    param('id').notEmpty().withMessage('User id is required'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
  ],
  (req, res) => {
    const { id } = req.params;

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'User not found',
        statusCode: 404,
      });
    }

    const updatedUser = { ...users[userIndex], ...req.body };
    users[userIndex] = updatedUser;

    res.json(updatedUser);
  },
);

// ----------------------------------------------------
// DELETE USER
// ----------------------------------------------------
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         $ref: "#/components/responses/NotFound"
 */
router.delete(
  '/users/:id',
  [param('id').notEmpty().withMessage('user id is required')],
  (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'User not found',
        statusCode: 404,
      });
    }

    users.splice(userIndex, 1);

    res.json({ message: 'User deleted successfully' });
  },
);

// ----------------------------------------------------
// Mount Router & Error Handler
// ----------------------------------------------------
app.use('/api/v1', router);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong',
    statusCode: 500,
  });
});

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger Docs → http://localhost:${PORT}/api-docs`);
});
