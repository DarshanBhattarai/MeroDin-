export const getCurrentUser = async (req, res, next) => {
  try {
    // Since middleware already verified and attached user
    const user = req.user;
    
    if (!user) {
      throw new AuthenticationError("Not authenticated");
    }

    // Return only necessary user data
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
};