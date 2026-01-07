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
// UPLOAD IMAGE (gallery)
// -------------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  const { link, subtitle } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const gcsFile = bucket.file(`images/${file.originalname}`);

    await gcsFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFile.name}`;

    const imageData = {
      filename: gcsFile.name,          // stored path in bucket
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
      .orderBy("createdAt", "desc")
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
app.delete("/images/subtitle/:subtitle", async (req, res) => {
  const { subtitle } = req.params;

  try {
    const snapshot = await db
      .collection("galleryImages")
      .where("subtitle", "==", subtitle)
      .get();

    if (snapshot.empty)
      return res.status(404).json({ message: "Image not found" });

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Delete from storage
    await bucket.file(data.filename).delete();

    // Delete Firestore record
    await db.collection("galleryImages").doc(doc.id).delete();

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
app.delete("/delete_banner", async (req, res) => {
  try {
    await bucket.file("banner/banner.jpg").delete();
    res.json({ message: "Banner deleted successfully!" });
  } catch (err) {
    console.error(err);
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
