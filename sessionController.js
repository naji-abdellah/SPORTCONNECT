const Session = require("../models/Session");

const resolveCreatorName = (uid) => {
  return new Promise((resolve) => {
    const authHost = 'auth-service';
    const path = `/auth/user/${uid}`;
    const options = { hostname: authHost, port: 3001, path, method: 'GET' };
    const req = require('http').request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.displayName || uid.slice(0, 8) + '...');
        } catch { resolve(uid.slice(0, 8) + '...'); }
      });
    });
    req.on('error', () => resolve(uid.slice(0, 8) + '...'));
    req.end();
  });
};
// Validation simple
const validateSessionData = (data) => {
const { title, sport_name, location, date, time, maxParticipants, createdBy } = data;
if (!title || !sport_name || !location || !date || !time || !maxParticipants || !createdBy){
    return "Tous les champs sont obligatoires";
  }

  if (maxParticipants <= 0) {
    return "Le nombre maximum de participants doit être supérieur à 0";
  }

  return null;
};

// Créer une session
exports.createSession = async (req, res) => {
  try {
    const error = validateSessionData(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }
    const creatorName = req.body.creatorName || await resolveCreatorName(req.body.createdBy);
    const session = await Session.create({ ...req.body, creatorName });

   
    res.status(201).json({
      message: "Session créée avec succès",
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Voir toutes les sessions avec filtres
exports.getSessions = async (req, res) => {
  try {
    const { sport, location, status } = req.query;

    const filter = {};

    if (sport) filter.sport = sport;
    if (location) filter.location = location;
    if (status) filter.status = status;

    const sessions = await Session.find(filter).sort({ date: 1, time: 1 });

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Voir une session par ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "ID invalide ou erreur serveur" });
  }
};

// Modifier une session
exports.updateSession = async (req, res) => {
  try {
    const { userId } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    if (session.createdBy !== userId) {
      return res.status(403).json({ message: "Seul le créateur peut modifier cette session" });
    }

    const fieldsToUpdate = ["title", "sport", "location", "date", "time", "maxParticipants"];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    if (session.maxParticipants <= 0) {
      return res.status(400).json({ message: "maxParticipants doit être supérieur à 0" });
    }

    if (session.participants.length >= session.maxParticipants) {
      session.status = "full";
    } else {
      session.status = "open";
    }

    await session.save();

    res.status(200).json({
      message: "Session modifiée avec succès",
      session
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rejoindre une session
exports.joinSession = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId est obligatoire" });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    if (session.status === "cancelled") {
      return res.status(400).json({ message: "Cette session est annulée" });
    }

    if (session.participants.includes(userId)) {
      return res.status(400).json({ message: "Utilisateur déjà inscrit" });
    }

    if (session.participants.length >= session.maxParticipants) {
      session.status = "full";
      await session.save();
      return res.status(400).json({ message: "Session complète" });
    }

    session.participants.push(userId);

    if (session.participants.length >= session.maxParticipants) {
      session.status = "full";
    }

    await session.save();

    res.status(200).json({
      message: "Utilisateur ajouté à la session",
      session
    });
  } catch (error) {
    res.status(500).json({ message: "ID invalide ou erreur serveur" });
  }
};

// Quitter une session
exports.leaveSession = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId est obligatoire" });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    if (!session.participants.includes(userId)) {
      return res.status(400).json({ message: "Utilisateur non inscrit à cette session" });
    }

    session.participants = session.participants.filter((id) => id !== userId);

    if (session.status !== "cancelled") {
      session.status = "open";
    }

    await session.save();

    res.status(200).json({
      message: "Utilisateur retiré de la session",
      session
    });
  } catch (error) {
    res.status(500).json({ message: "ID invalide ou erreur serveur" });
  }
};

// Annuler une session
exports.cancelSession = async (req, res) => {
  try {
    const { userId } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    if (session.createdBy !== userId) {
      return res.status(403).json({ message: "Seul le créateur peut annuler cette session" });
    }

    session.status = "cancelled";

    await session.save();

    res.status(200).json({
      message: "Session annulée avec succès",
      session
    });
  } catch (error) {
    res.status(500).json({ message: "ID invalide ou erreur serveur" });
  }
};

// Supprimer une session
exports.deleteSession = async (req, res) => {
  try {
    const { userId } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    if (session.createdBy !== userId) {
      return res.status(403).json({ message: "Seul le créateur peut supprimer cette session" });
    }

    await session.deleteOne();

    res.status(200).json({ message: "Session supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "ID invalide ou erreur serveur" });
  }
};