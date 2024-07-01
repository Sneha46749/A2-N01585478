/* 
Name : SNEHA
ID: N01585478
*/
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the /uploads directory
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app
  .route("/upload")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload.html"));
  })
  .post(upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send(`File uploaded successfully: ${req.file.path}`);
  });

app
  .route("/upload-multiple")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
  })
  .post(upload.array("files", 100), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    const filePaths = req.files.map((file) => file.path);
    res
      .status(200)
      .send(`Files uploaded successfully: ${filePaths.join(", ")}`);
  });

app.get("/fetch-single", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");

  let uploads = fs.readdirSync(upload_dir);
  console.log(uploads);

  if (uploads.length == 0) {
    return res.status(503).send({
      message: "No images",
    });
  }
  let max = uploads.length - 1;
  let min = 0;

  let index = Math.round(Math.random() * (max - min) + min);
  let randomImage = uploads[index];

  res.sendFile(path.join(upload_dir, randomImage));
});

app.get("/single", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "single.html"));
});


//Fetch Multiple
app.get("/fetch-multiple", (req, res) => {
  let upload_dir = path.join(__dirname, "uploads");

  let uploads = fs.readdirSync(upload_dir);
  console.log(uploads);
  if (uploads.length == 0) {
    return res.status(503).send({
      message: "No images",
    });
  }

  let selectedImages = [];
  for (let i = 0; i < 3; i++) {
    let index = Math.floor(Math.random() * uploads.length);
    selectedImages.push(path.join('/uploads', uploads[index]));
    uploads.splice(index, 1);
  }

  res.json(selectedImages);
});

app.get("/multiple", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "multiple.html"));
});

// Gallery page
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery.html"));
});

app.get("/fetch-all-images", (req, res) => {
  let uploadDir = path.join(__dirname, "uploads");

  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          console.error("Error reading uploads directory:", err);
          return res.status(500).send("Internal Server Error");
      }

      const imagePaths = files.map(file => path.join('/uploads', file));
      res.json(imagePaths);
  });
});

// Gallery with pagination
app.get("/gallery-pagination", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery-pagination.html"));
});

app.get("/fetch-all-pagination/pages/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const pageSize = 5; // Number of images per page
  const startIndex = index * pageSize;
  const endIndex = startIndex + pageSize;
  let uploadDir = path.join(__dirname, "uploads");

  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          console.error("Error reading uploads directory:", err);
          return res.status(500).send("Internal Server Error");
      }

      const paginatedFiles = files.slice(startIndex, endIndex);
      const imagePaths = paginatedFiles.map(file => path.join('/uploads', file));
      res.json(imagePaths);
  });
});

// catch all other requests
app.use((req, res) => {
  res.status(404).send("Route not found");
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
