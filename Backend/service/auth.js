import jwt from 'jsonwebtoken';

const secret = "shraddha191206@";

export function setUser(user) {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
      password: user.password,
      role: user.role,
    },
    secret,
    { expiresIn: '7d' }
  );
}

export function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
