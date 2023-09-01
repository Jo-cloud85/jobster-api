import Errors from '../errors/index.js';

const testUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new Errors.BadRequestError('Test User. Read Only!');
  }
  next();
};

export default testUser;