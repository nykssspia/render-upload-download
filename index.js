const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Dosyalar uploads klasörüne kaydedilecek
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.json());

// Dosya yükleme endpointi
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Dosya yüklenmedi");
  }
  res.json({
    filename: req.file.filename,
    originalname: req.file.originalname,
    url: `/download/${req.file.filename}`
  });
});

// Yüklü dosyaların listesini dönen endpoint
app.get("/files", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.status(500).send("Dosyalar listelenemedi");
    }
    const fileList = files.map(file => ({
      filename: file,
      url: `/download/${file}`
    }));
    res.json(fileList);
  });
});

// Dosya indirme endpointi
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "uploads", filename);
  res.download(filepath, err => {
    if (err) {
      res.status(404).send("Dosya bulunamadı");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
