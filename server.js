import express from "express";
import multer from "multer";
import cors from "cors";
import { Storage } from "@google-cloud/storage";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
// Configure Google Cloud Storage
// -------------------------
const BUCKET_NAME = "messagesapi";
const storage = new Storage();
const bucket = storage.bucket(BUCKET_NAME);

// Multer memory storage for Cloud Run
const upload = multer({ storage: multer.memoryStorage() });

// -------------------------
// In-memory store for images
// -------------------------
let images = [];

// -------------------------
// Upload image
// -------------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  const { link, subtitle } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  try {
    const gcsFile = bucket.file(`${Date.now()}-${file.originalname}`);
    await gcsFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
    await gcsFile.makePublic(); // public access

    const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${gcsFile.name}`;

    const imageData = {
      filename: file.originalname,
      path: imageUrl,
      link: link || null,
      subtitle: subtitle || "",
    };

    images.push(imageData);
    res.json({ message: "File uploaded successfully", image: imageData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// -------------------------
// List images
// -------------------------
app.get("/images", (req, res) => {
  res.json({ images });
});

// -------------------------
// Delete image by subtitle
// -------------------------
app.delete("/images/subtitle/:subtitle", async (req, res) => {
  const { subtitle } = req.params;
  const index = images.findIndex((img) => img.subtitle === subtitle);
  if (index === -1) return res.status(404).json({ message: "Image not found" });

  const filename = images[index].filename;
  try {
    await bucket.file(filename).delete();
  } catch (err) {
    console.error(err);
  }

  images.splice(index, 1);
  res.json({ message: "Deleted successfully" });
});

// -------------------------
// Upload banner
// -------------------------
app.post("/upload_banner", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded." });

  try {
    const gcsFile = bucket.file(`banners/${Date.now()}-${file.originalname}`);
    await gcsFile.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
    await gcsFile.makePublic();

    const imageUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${gcsFile.name}`;
    res.json({ message: "Banner uploaded successfully!", imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// -------------------------
// Delete banner
// -------------------------
app.delete("/delete_banner/:filename", async (req, res) => {
  const { filename } = req.params;
  try {
    await bucket.file(`banners/${filename}`).delete();
    res.json({ message: "Banner deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting file." });
  }
});

// -------------------------
// Test route
// -------------------------
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Server listening on port ${PORT}`));
