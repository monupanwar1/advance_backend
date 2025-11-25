import compression from 'compression';
import express from 'express';
import { body, param, validationResult } from 'express-validator';

const app = express();

const PORT = process.env.PORT || 3500;

// parse json

app.use(express.json());

// use compression
app.use(compression());

// caching for GET request

app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=60');
  }
  next();
});

// In memory data store

let users = [];

//Router
const router = express.Router();

// Get all users

router.get('/users', (req, res) => {
  res.json(users);
});

// Get a user by id:
router.get(
  '/users/:id',
  [param('id').notEmpty().withMessage('user id is required')],
  (req, res) => {
    const { id } = req.params;
    const user = users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    return res.json(user);
  },
);

// Create a User
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

// put
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
        error: 'Not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    const updateUser = { ...users[userIndex], ...req.body };
    users[userIndex] = updateUser;
    res.json(updateUser);
  },
);

// delete

router.delete(
  '/users/:id',
  [param('id').notEmpty().withMessage('user id is required')],
  (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    users.splice(userIndex, 1);
    res.json({
      message: 'User deleted successfully',
    });
  },
);

app.use('/api/v1', router);
// global error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong',
    statusCode: 500,
  });

  next();
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

