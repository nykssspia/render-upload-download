const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "admin123";  // İstersen değiştir

// uploads klasörü yoksa oluştur
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Dosya yükleme
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("Dosya yüklenmedi");
  res.json({
    filename: req.file.filename,
    originalname: req.file.originalname,
    url: `/download/${req.file.filename}`
  });
});

// Yüklü dosyaları listele (API)
app.get("/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send("Dosyalar listelenemedi");
    const fileList = files.map(file => ({
      filename: file,
      url: `/download/${file}`
    }));
    res.json(fileList);
  });
});

// Dosya indir
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);
  res.download(filepath, err => {
    if (err) res.status(404).send("Dosya bulunamadı");
  });
});

// Basit yönetim paneli için middleware (şifre kontrolü)
function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).send("Yetkisiz erişim");
  }
  next();
}

// Yönetim paneli dosya listeleme (API)
app.get("/admin/files", adminAuth, (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send("Dosyalar listelenemedi");
    const fileList = files.map(file => ({
      filename: file,
      url: `/download/${file}`
    }));
    res.json(fileList);
  });
});

// Yönetim panelinden dosya silme (API)
app.delete("/admin/delete/:filename", adminAuth, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);
  fs.unlink(filepath, err => {
    if (err) return res.status(404).send("Dosya bulunamadı veya silinemedi");
    res.json({ message: "Dosya silindi" });
  });
});

// Yönetim paneli sayfası
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
