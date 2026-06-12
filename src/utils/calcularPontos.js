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