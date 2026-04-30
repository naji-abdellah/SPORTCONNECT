// ============================================
// user-service/src/routes/user.routes.js
// CRUD complet des profils utilisateurs (Firestore)
// ============================================

const express = require('express');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Référence à la collection Firestore "users"
// Chaque document = un profil utilisateur, avec l'UID comme ID du document
const usersCollection = db.collection('users');

// Valeurs autorisées pour le champ "niveau"
const NIVEAUX_VALIDES = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];


// ──────────────────────────────────────────────────────────────
// POST /users/internal/create
// Route INTERNE : appelée par l'Auth Service après l'inscription
// Pas de vérification de token JWT ici (appel de service à service)
//
// Body JSON attendu :
// {
//   "uid": "abc123",
//   "email": "mehdi@gmail.com",
//   "nom": "Mehdi Alami",
//   "sportPrefere": "football",
//   "niveau": "débutant",
//   "localisation": "Casablanca"
// }
// ──────────────────────────────────────────────────────────────
router.post('/internal/create', async (req, res) => {
  const { uid, email, nom, sportPrefere, niveau, localisation, age, bio } = req.body;

  if (!uid || !email || !nom) {
    return res.status(400).json({ error: 'uid, email et nom sont obligatoires.' });
  }

  try {
    // Vérifie si le profil existe déjà (évite les doublons)
    const existing = await usersCollection.doc(uid).get();
    if (existing.exists) {
      return res.status(409).json({ error: 'Profil déjà existant pour cet UID.' });
    }

    const userData = {
      uid,
      email,
      nom,
      sportPrefere: sportPrefere || 'Non spécifié',
      niveau: niveau || 'Beginner',
      localisation: localisation || 'Non spécifiée',
      age: age || null,
      bio: bio || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // doc(uid) → le UID Firebase devient l'ID du document Firestore
    // C'est le lien entre Firebase Auth et Firestore
    await usersCollection.doc(uid).set(userData);

    console.log(`✅ Profil Firestore créé pour : ${uid}`);
    res.status(201).json({ message: 'Profil créé.', uid });

  } catch (error) {
    console.error('❌ Erreur création profil interne:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});


// ──────────────────────────────────────────────────────────────
// POST /users
// Crée le profil de l'utilisateur connecté (via son token)
//
// Header requis : Authorization: Bearer <idToken>
// Body JSON attendu :
// {
//   "nom": "Mehdi Alami",
//   "sportPrefere": "football",
//   "niveau": "intermédiaire",
//   "localisation": "Casablanca"
// }
// ──────────────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  const { nom, sportPrefere, niveau, localisation, age, bio } = req.body;
  const uid = req.user.uid;

  // ── Validation ──
  if (!nom || !sportPrefere || !niveau || !localisation) {
    return res.status(400).json({
      error: 'Les champs nom, sportPrefere, niveau et localisation sont obligatoires.',
    });
  }

  if (!NIVEAUX_VALIDES.includes(niveau)) {
    return res.status(400).json({
      error: `Le champ niveau doit être : ${NIVEAUX_VALIDES.join(', ')}`,
    });
  }

  try {
    const existing = await usersCollection.doc(uid).get();
    if (existing.exists) {
      return res.status(409).json({
        error: 'Tu as déjà un profil. Utilise PATCH /users/me pour le modifier.',
      });
    }

    const userData = {
      uid,
      email: req.user.email,
      nom,
      sportPrefere,
      niveau: niveau || 'Beginner',
      localisation,
      age: age || null,
      bio: bio || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await usersCollection.doc(uid).set(userData);

    res.status(201).json({
      message: 'Profil créé avec succès !',
      user: { ...userData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    });

  } catch (error) {
    console.error('❌ Erreur POST /users:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du profil.' });
  }
});


// ──────────────────────────────────────────────────────────────
// GET /users/me
// Récupère le profil complet de l'utilisateur connecté
//
// Header requis : Authorization: Bearer <idToken>
// ──────────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const doc = await usersCollection.doc(req.user.uid).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Profil non trouvé.',
        aide: 'Crée ton profil avec POST /users',
      });
    }
const data = doc.data();
res.json({
  ...data,
  createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
  updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
});
  } catch (error) {
    console.error('❌ Erreur GET /users/me:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});


// ──────────────────────────────────────────────────────────────
// GET /users
// Liste tous les utilisateurs (avec filtres optionnels)
//
// Header requis : Authorization: Bearer <idToken>
//
// Query params optionnels :
//   ?sport=football
//   ?niveau=débutant
//   ?sport=tennis&niveau=avancé
//
// Exemple : GET /users?sport=football&niveau=intermédiaire
// ──────────────────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  const { sport, niveau } = req.query;

  try {
    let query = usersCollection;

    if (sport) query = query.where('sportPrefere', '==', sport);
    if (niveau) query = query.where('niveau', '==', niveau);

    // Limite à 50 résultats pour éviter les surcharges
    const snapshot = await query.limit(50).get();

    const users = [];
    snapshot.forEach(doc => {
      // On retire l'email des résultats publics (confidentialité)
      const { email, ...publicData } = doc.data();
      users.push(publicData);
    });

    res.json({
      count: users.length,
      filtres: { sport: sport || null, niveau: niveau || null },
      users,
    });

  } catch (error) {
    // ⚠️ Erreur fréquente : si tu filtres sur 2 champs simultanément,
    // Firestore exige un index composite.
    // Dans ce cas, le message d'erreur contient un lien pour le créer automatiquement.
    if (error.code === 9) {
      return res.status(500).json({
        error: 'Index Firestore manquant pour cette combinaison de filtres.',
        aide: 'Vérifie les logs du terminal — un lien de création automatique d\'index y apparaît.',
      });
    }
    console.error('❌ Erreur GET /users:', error);
    res.status(500).json({ error: 'Erreur lors de la liste des utilisateurs.' });
  }
});


// ──────────────────────────────────────────────────────────────
// GET /users/:uid
// Récupère le profil PUBLIC d'un autre utilisateur
//
// Header requis : Authorization: Bearer <idToken>
// ──────────────────────────────────────────────────────────────
router.get('/:uid', verifyToken, async (req, res) => {
  try {
    const doc = await usersCollection.doc(req.params.uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    // Retire l'email (info privée) avant de renvoyer
    const { email, ...publicProfile } = doc.data();
    res.json(publicProfile);

  } catch (error) {
    console.error('❌ Erreur GET /users/:uid:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});


// ──────────────────────────────────────────────────────────────
// PATCH /users/me
// Modifie partiellement le profil de l'utilisateur connecté
// (PATCH = seulement les champs fournis, les autres restent intacts)
//
// Header requis : Authorization: Bearer <idToken>
// Body JSON (tous optionnels) :
// {
//   "nom": "Nouveau nom",
//   "sportPrefere": "basketball",
//   "niveau": "avancé",
//   "localisation": "Rabat"
// }
// ──────────────────────────────────────────────────────────────
router.patch('/me', verifyToken, async (req, res) => {
  const { nom, sportPrefere, niveau, localisation, age, bio } = req.body;
  const uid = req.user.uid;

  // Construit l'objet de mise à jour avec seulement les champs fournis
  const updates = {};
  if (nom) updates.nom = nom;
  if (sportPrefere) updates.sportPrefere = sportPrefere;
  if (niveau) {
    if (!NIVEAUX_VALIDES.includes(niveau)) {
      return res.status(400).json({
        error: `Le champ niveau doit être : ${NIVEAUX_VALIDES.join(', ')}`,
      });
    }
    updates.niveau = niveau;
  }
  if (localisation) updates.localisation = localisation;
  if (age !== undefined) updates.age = age;
  if (bio !== undefined) updates.bio = bio;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      error: 'Fournis au moins un champ à modifier : nom, sportPrefere, niveau, localisation, age, bio.',
    });
  }

  // Ajoute la date de mise à jour automatiquement
  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  try {
    const doc = await usersCollection.doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Profil non trouvé. Crée-le d\'abord avec POST /users.',
      });
    }

    // { merge: true } = ne modifie QUE les champs fournis
    // Sans merge, ça remplacerait TOUT le document !
    await usersCollection.doc(uid).set(updates, { merge: true });

    // Récupère le document mis à jour pour le renvoyer
    const updatedDoc = await usersCollection.doc(uid).get();

    res.json({
      message: 'Profil mis à jour avec succès !',
      champsMisAJour: Object.keys(updates).filter(k => k !== 'updatedAt'),
      user: updatedDoc.data(),
    });

  } catch (error) {
    console.error('❌ Erreur PATCH /users/me:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});


// ──────────────────────────────────────────────────────────────
// DELETE /users/me
// Supprime le profil Firestore ET le compte Firebase Auth
//
// Header requis : Authorization: Bearer <idToken>
// ──────────────────────────────────────────────────────────────
router.delete('/me', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    // Étape 1 : Supprimer le document dans Firestore
    await usersCollection.doc(uid).delete();
    console.log(`✅ Document Firestore supprimé : ${uid}`);

    // Étape 2 : Supprimer l'utilisateur dans Firebase Auth
    await admin.auth().deleteUser(uid);
    console.log(`✅ Utilisateur Firebase Auth supprimé : ${uid}`);

    res.json({
      message: 'Compte et profil supprimés définitivement.',
      uid,
    });

  } catch (error) {
    console.error('❌ Erreur DELETE /users/me:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte.' });
  }
});

module.exports = router;
