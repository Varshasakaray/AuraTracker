import { getUser } from '../service/auth.js';
import User from '../models/user.js';

async function checkAuthentication(req, res, next) {
  const token_cookie = req.cookies?.uid; // Retrieve the token from cookies
  req.user = null; // Initialize user to null

  if (!token_cookie) {
    return res.redirect('/sign_in');
  }

  try {
    const decoded = getUser(token_cookie); // Use getUser to decode token
    const user = await User.findById(decoded.id); // Retrieve user from DB by ID

    if (!user) {
      return res.redirect('/sign_in');
    }

    req.user = user; // Attach user information to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in checkAuthentication middleware:', error);
    return res.redirect('/sign_in');
  }
}

// Middleware for role-based access control
function restrictTo(roles = []) {
  return function (req, res, next) {
    const token_cookie = req.cookies?.uid;
    const user = getUser(token_cookie); 
    req.user = user;
    console.log(req.user);
    if (!req.user) {
      return res.redirect('/sign_in'); // Redirect if user is not authenticated
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).send('Unauthorized'); // Deny access if user role is not allowed
    }

    next(); // Proceed if the user's role is authorized
  };
}

export { checkAuthentication, restrictTo };
