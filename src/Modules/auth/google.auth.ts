const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("CLIENT_ID");

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "CLIENT_ID",  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  const userId = payload['sub'];  // Use this userId to find or create a user in your DB
}




//  SignUp Google code



// app.post('/api/auth/google', async (req, res) => {
//     const { idToken } = req.body;
  
//     // Verify token
//     const ticket = await client.verifyIdToken({
//       idToken,
//       audience: CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     const email = payload['email'];
  
//     // Check if user exists
//     let user = await User.findOne({ email });
//     if (!user) {
//       // Create new user
//       user = new User({ email, name: payload['name'], picture: payload['picture'] });
//       await user.save();
//     }
  
//     // Generate session token (JWT)
//     const token = jwt.sign({ userId: user._id }, 'your_secret_key');
  
//     res.json({ token });
//   });