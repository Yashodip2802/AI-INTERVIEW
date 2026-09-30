import {Router} from 'express';
import { getMeController, loginUserController, logoutUserController, registerUserController } from '../controllers/auth.controller.js';
import authUser from '../middlewares/auth.middleware.js';

const authRouter = Router();


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', registerUserController)

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', loginUserController)

/**
 * @route GET /api/auth/logout
 * @desc Logout a user by clearing the token cookie
 * @access Public
 */

authRouter.get('/logout', logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @desc Get the currently authenticated user's information
 * @access Private
 */
authRouter.get('/get-me', authUser, getMeController)

export default authRouter;