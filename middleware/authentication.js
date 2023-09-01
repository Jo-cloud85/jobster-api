import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import Errors from '../errors/index.js'

const auth = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
         throw new Errors.UnauthenticatedError('Authentication invalid')
    }
    const token = authHeader.split(' ')[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const testUser = payload.userId === '64ef495e8e03b6ae6d733bd3';
        req.user = { userId: payload.userId, testUser };
        next()
    } catch (error) {
        throw new  Errors.UnauthenticatedError('Authentication invalid')
    }
}

export default auth
