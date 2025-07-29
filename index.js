const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("Dosya yüklenmedi");
  res.json({
    filename: req.file.filename,
    originalname: req.file.originalname,
    url: `/download/${encodeURIComponent(req.file.filename)}` // URL encode ekledim
  });
});

app.get("/files", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send("Dosyalar listelenemedi");
    const fileList = files.map(file => ({
      filename: file,
      url: `/download/${encodeURIComponent(file)}`
    }));
    res.json(fileList);
  });
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);
  res.download(filepath, err => {
    if (err) res.status(404).send("Dosya bulunamadı");
  });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
