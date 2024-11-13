const express = require("express");
const bodyParser = require("body-parser");
const Fuse = require("fuse.js");
const solutiones = require("./combinedSolutions.json"); // Carrega o JSON de soluções
const cors = require("cors");
const schedule = require("node-schedule");

const updateRoutine = require("./updateRoutine");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

// Configurações do Fuse.js
schedule.scheduleJob("0 * * * * *", updateRoutine);
const fuseOptions = {
  keys: ["TITULO", "DESCRIPTION", "SOLUTION"],
  threshold: 0.7,
};
const fuse = new Fuse(solutiones[0].data, fuseOptions);

// Rota de pesquisa
app.get("/search", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query is required" });
  }

  let results;
  try {
    results = fuse.search(query).map((result) => result.item);
  } catch (error) {
    console.error("Erro ao processar a busca:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }

  return res.json(results);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
