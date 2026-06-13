export function calcularPontuacao(
  golsCasaReal,
  golsForaReal,
  golsCasaPalpite,
  golsForaPalpite
) {
  if (
    golsCasaPalpite === null ||
    golsForaPalpite === null
  ) {
    return null;
  }

  if (
    golsCasaReal === null ||
    golsForaReal === null
  ) {
    return null;
  }

  // Acertou placar exato
  if (
    golsCasaReal === golsCasaPalpite &&
    golsForaReal === golsForaPalpite
  ) {
    return 3;
  }

  const resultadoReal =
    golsCasaReal > golsForaReal
      ? "casa"
      : golsCasaReal < golsForaReal
      ? "fora"
      : "empate";

  const resultadoPalpite =
    golsCasaPalpite > golsForaPalpite
      ? "casa"
      : golsCasaPalpite < golsForaPalpite
      ? "fora"
      : "empate";

  if (resultadoReal === resultadoPalpite) {
    return 1;
  }

  return 0;
}

export function calcularEstatisticasParticipante(
  nomeParticipante,
  partidas,
  palpites
) {
  let pontos = 0;
  let acertosExatos = 0;
  let acertosResultado = 0;
  let erros = 0;

  partidas.forEach(partida => {
    const palpitePartida = palpites.find(
      p => p.partidaId === partida.id
    );

    if (!palpitePartida) return;

    const palpite = palpitePartida[nomeParticipante];

    if (!palpite) return;

    const resultado = calcularPontuacao(
      partida.golsCasa,
      partida.golsFora,
      palpite[0],
      palpite[1]
    );

    if (resultado === null) return;

    pontos += resultado;

    if (resultado === 3) {
      acertosExatos++;
    } else if (resultado === 1) {
      acertosResultado++;
    } else {
      erros++;
    }
  });

  const totalAnalisado =
    acertosExatos +
    acertosResultado +
    erros;

  const aproveitamento =
    totalAnalisado === 0
      ? 0
      : Math.round(
          (pontos / (totalAnalisado * 3)) * 100
        );

  return {
    pontos,
    acertosExatos,
    acertosResultado,
    erros,
    aproveitamento
  };
}

// Pontos por acerto em cada fase do mata-mata
const PONTOS_MATA_MATA = {
  "dezesseisAvos": 1,
  "oitavas": 2,
  "quartas": 3,
  "semi": 4,
  "final": 5,
  "campeao": 10
};

// Extrai os IDs das seleções que participaram de uma fase
// a partir das partidas do mata-mata
function getSelecoesDaFase(partidasMataMata, fase) {
  const partidasDaFase = partidasMataMata.filter(
    p => p.fase === fase
  );

  const ids = new Set();

  partidasDaFase.forEach(partida => {
    if (partida.casaId !== null) ids.add(partida.casaId);
    if (partida.foraId !== null) ids.add(partida.foraId);
  });

  return ids;
}

// Extrai o ID do vencedor de uma partida
function getVencedor(partida) {
  if (
    partida.golsCasa === null ||
    partida.golsFora === null
  ) return null;

  return partida.golsCasa > partida.golsFora
    ? partida.casaId
    : partida.foraId;
}

export function calcularPontosMataMata(
  palpiteParticipante,
  partidasMataMata
) {
  let pontos = 0;
  let detalhes = {};

  // Mapeamento entre chave do palpite e nome da fase em partidasMataMata
  const fases = [
    { chave: "dezesseisAvos", nomeFase: "Rodada de 32" },
    { chave: "oitavas",       nomeFase: "Oitavas de Final" },
    { chave: "quartas",       nomeFase: "Quartas de Final" },
    { chave: "semi",          nomeFase: "Semifinal" },
    { chave: "final",         nomeFase: "Final" }
  ];

  fases.forEach(({ chave, nomeFase }) => {
    const palpiteIds = palpiteParticipante[chave] || [];
    const selecoesDaFase = getSelecoesDaFase(partidasMataMata, nomeFase);

    // Só pontua se a fase já tem pelo menos uma partida com times definidos
    if (selecoesDaFase.size === 0) {
      detalhes[chave] = { acertos: 0, total: palpiteIds.length, pontos: 0 };
      return;
    }

    let acertos = 0;
    palpiteIds.forEach(id => {
      if (selecoesDaFase.has(id)) acertos++;
    });

    const pontosFase = acertos * PONTOS_MATA_MATA[chave];
    pontos += pontosFase;

    detalhes[chave] = {
      acertos,
      total: palpiteIds.length,
      pontos: pontosFase
    };
  });

  // Campeão — vencedor da partida Final
  const partidaFinal = partidasMataMata.find(p => p.fase === "Final");
  const campeaoReal = partidaFinal ? getVencedor(partidaFinal) : null;
  let acertouCampeao = false;

  if (campeaoReal !== null) {
    acertouCampeao = palpiteParticipante.campeaoId === campeaoReal;
    if (acertouCampeao) pontos += PONTOS_MATA_MATA["campeao"];
  }

  detalhes["campeao"] = {
    acertos: acertouCampeao ? 1 : 0,
    total: 1,
    pontos: acertouCampeao ? PONTOS_MATA_MATA["campeao"] : 0
  };

  return { pontos, detalhes };
}