const axios = require("axios");
const fs = require("fs");
const schedule = require("node-schedule");

module.exports = function updateRoutine() {
  console.log("bolabola");

  const getSolutionPage = async (page) => {
    try {
      console.log(`Buscando dados da página ${page}...`);
      const response = await axios.get(
        `https://serproqa.proa.ai/serpro/service/catalogos/gerarCatalogos?limit=200&page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar página ${page}:`, error);
      return null;
    }
  };

  const getAllSolutions = async () => {
    try {
      const firstPageData = await getSolutionPage(1);
      const totalPages = firstPageData.meta.totalPages;

      let allSolutions = [firstPageData]; // Inicializa com a primeira página

      // Loop para buscar todas as páginas
      for (let page = 2; page <= totalPages; page++) {
        const pageData = await getSolutionPage(page);
        if (pageData) {
          allSolutions.push(pageData); // Adiciona cada resposta ao array
        }
      }

      return allSolutions;
    } catch (error) {
      console.error("Erro ao buscar todas as soluções:", error);
    }
  };

  const saveSolutionsToFile = async () => {
    const solutions = await getAllSolutions();
    if (solutions) {
      fs.writeFile(
        `${__dirname}/combinedSolutions.json`,
        JSON.stringify(solutions, null, 2),
        (err) => {
          if (err) {
            console.error("Erro ao salvar o arquivo JSON:", err);
          } else {
            console.log("Arquivo JSON salvo com sucesso.");
          }
        }
      );
    }
  };

  // Agendamento para executar exatamente à meia-noite
  // schedule.scheduleJob("0 0 0 * * *", saveSolutionsToFile);
  saveSolutionsToFile();
  console.log("Agendamento para criação de JSON configurado para 00:00.");
};
