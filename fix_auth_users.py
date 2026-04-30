# fix_auth_users.py
path = r"C:\Users\DELL\CAREER\GLD\S4\APPLICATION NATIVE CLOUD\sportconnect-docker\auth-service\src\routes\auth.routes.js"

new_endpoint = """
// GET /auth/users
// Returns all registered users from Firebase Auth
router.get('/users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const currentUid = req.headers['x-user-uid'] || '';
    const users = listUsersResult.users
      .filter(u => u.uid !== currentUid)
      .map(u => ({
        uid: u.uid,
        displayName: u.displayName || u.email.split('@')[0],
        email: u.email,
        city: 'Casablanca',
        sport: 'Football',
        level: 'Intermediate',
        sessions: 0,
        bio: 'SportConnect member.',
      }));
    res.json({ users });
  } catch (error) {
    console.error('Error /auth/users:', error);
    res.status(500).json({ error: 'Could not fetch users.' });
  }
});

"""

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("module.exports = router;", new_endpoint + "module.exports = router;")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")