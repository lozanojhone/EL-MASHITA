const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(publicPath, "register.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.html"));
});

app.use((req, res) => {
  res.status(404).send("Página no encontrada.");
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
