import express from "express";
import multer from "multer";
import cors from "cors";
import { Storage } from "@google-cloud/storage";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
// Firebase Admin
// -------------------------
admin.initializeApp();
const db = admin.firestore();

// -------------------------
// Google Cloud Storage
// -------------------------
const BUCKET_NAME = "messagesapi";
const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

// Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------
// UPLOAD TEAM
// -------------------------
app.post("/uploadteam", upload.single("file"), async (req, res) => {
  const { name, role, bio, linkedin, github, website } = req.body;
  const photo = req.photo;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const gcsFile = bucket.file(`teamimages/${Date.now()}-${photo.originalname}`);

    await gcsFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFile.name}`;

    const imageData = {
      filename: gcsFile.name, // stored path in bucket
      url: imageUrl,

      name: name || "",
      role: role || "",
      bio: bio || "",
      linkedin: linkedin || "",
      github: github || "",
      website: website || "",

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    };

    const docRef = await db.collection("teamMembers").add(imageData);

    res.json({
      message: "File uploaded successfully",
      image: { id: docRef.id, ...imageData },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});


// -------------------------
// UPLOAD IMAGE (gallery)
// -------------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  const { link, subtitle } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const gcsFile = bucket.file(`images/${Date.now()}-${file.originalname}`);

    await gcsFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFile.name}`;

    const imageData = {
      filename: gcsFile.name, // stored path in bucket
      url: imageUrl,
      subtitle: subtitle || "",
      link: link || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("galleryImages").add(imageData);

    res.json({
      message: "File uploaded successfully",
      image: { id: docRef.id, ...imageData },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});


// -------------------------
// LIST IMAGES
// -------------------------
app.get("/images", async (req, res) => {
  try {
    const snapshot = await db
      .collection("galleryImages")
      .orderBy("createdAt", "asc")
      .get();

    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
});

// -------------------------
// LIST TEAM
// -------------------------
app.get("/team", async (req, res) => {
  try {
    const snapshot = await db
      .collection("teamMembers")
      .orderBy("createdAt", "asc")
      .get();

    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
});

// -------------------------
// DELETE IMAGE BY SUBTITLE
// -------------------------
// DELETE IMAGE BY ID
app.delete("/images/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the Firestore document by ID
    const docRef = db.collection("galleryImages").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Image not found" });
    }

    const data = doc.data();

    // Delete from Cloud Storage
    await bucket.file(data.filename).delete();

    // Delete Firestore record
    await docRef.delete();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

app.post("/updateActivity", async (req, res) => {
  try {
    const { memberId } = req.body;
    const postRef = db.collection("teamMembers").doc(memberId);
    const doc = await postRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Member not found" });

    const member = doc.data();
    member.active = !member.active

    await postRef.update({ active: member.active });
    res.json({ message: "Activity updated", post: { id: memberId, ...member } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update activity" });
  }
});

// DELETE TEAM MEMBER BY ID
app.delete("/team/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get the Firestore document by ID
    const docRef = db.collection("teamMembers").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Image not found" });
    }

    const data = doc.data();

    // Delete from Cloud Storage
    await bucket.file(data.filename).delete();

    // Delete Firestore record
    await docRef.delete();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// -------------------------
// UPLOAD BANNER (overwrite)
// -------------------------
app.post("/upload_banner", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded." });

  try {
    const gcsFile = bucket.file(`banner/${file.originalname}`);

    await gcsFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${gcsFile.name}`;

    res.json({
      message: "Banner uploaded successfully!",
      imageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// -------------------------
// DELETE BANNER
// -------------------------
app.delete("/delete_banner/:filename", async (req, res) => {
  const { filename } = req.params;

  try {
    const path = `banner/${filename}`;

    await bucket.file(path).delete();

    res.json({ message: "Banner deleted successfully!", path });
  } catch (err) {
    console.error("DELETE_BANNER_ERROR:", err);

    // File not found case
    if (err.code === 404) {
      return res.status(404).json({ message: "File not found." });
    }

    res.status(500).json({ message: "Error deleting file." });
  }
});


// -------------------------
// TEST ROUTE
// -------------------------
app.get("/", (req, res) => res.send("It's SADS time!"));

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${PORT}`)
);
