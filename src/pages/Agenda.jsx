import BotaoVoltar from "../components/BotaoVoltar";
import { partidas } from "../data/partidas";
import { partidasMataMata } from "../data/partidasMataMata";
import { selecoes } from "../data/selecoes";
import { palpites } from "../data/palpites";
import { palpitesMataMata } from "../data/palpitesMataMata";
import { participantes } from "../data/participantes";
import { calcularPontuacao } from "../utils/calcularPontos";
import "../styles/Participante.css";
import "../styles/Agenda.css";

function Agenda() {
  const getSelecao = (id) =>
    selecoes.find(s => s.id === id);

  // Junta todas as partidas com tipo identificado
  const todasPartidas = [
    ...partidas.map(p => ({ ...p, tipoPartida: "grupos" })),
    ...partidasMataMata
      .filter(p => p.casaId !== null && p.foraId !== null)
      .map(p => ({ ...p, tipoPartida: "mataMata" }))
  ];

  const pendentes = todasPartidas
    .filter(p => p.golsCasa === null || p.golsFora === null)
    .sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.horario}`);
      const dtB = new Date(`${b.data}T${b.horario}`);
      return dtA - dtB;
    });

  const finalizadas = todasPartidas
    .filter(p => p.golsCasa !== null && p.golsFora !== null)
    .sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.horario}`);
      const dtB = new Date(`${b.data}T${b.horario}`);
      return dtB - dtA;
    });

  const datasPendentes = [...new Set(pendentes.map(p => p.data))];
  const datasFinalizadas = [...new Set(finalizadas.map(p => p.data))];

  // Para mata-mata: verifica se participante palpitou uma seleção na próxima fase
  function getPalpiteMataMata(participanteSlug, selecaoId, faseAtual) {
    const palpite = palpitesMataMata.find(p => p.participante === participanteSlug);
    if (!palpite) return false;

    const proximaFase = {
      "Rodada de 32":     "oitavas",
      "Oitavas de Final": "quartas",
      "Quartas de Final": "semi",
      "Semifinal":        "final",
      "Final":            "campeao"
    };

    const chaveProxima = proximaFase[faseAtual];
    if (!chaveProxima) return false;

    if (chaveProxima === "campeao") {
      return palpite.campeaoId === selecaoId;
    }

    return (palpite[chaveProxima] || []).includes(selecaoId);
  }

  function renderPalpitesPendente(partida) {
    if (partida.tipoPartida === "grupos") {
      return participantes.map(participante => {
        const palpitePartida = palpites.find(p => p.partidaId === partida.id);
        const palpite = palpitePartida?.[participante.slug];

        return (
          <div key={participante.id} className="linha-palpite">
            <span>{participante.nome}</span>
            <span>
              {!palpite || palpite[0] === null || palpite[1] === null
                ? "-"
                : `${palpite[0]} x ${palpite[1]}`}
            </span>
          </div>
        );
      });
    }

    // Mata-mata pendente: quais dos dois times o participante palpitou na próxima fase
    const casa = getSelecao(partida.casaId);
    const fora = getSelecao(partida.foraId);

    return participantes.map(participante => {
      const palpitouCasa = getPalpiteMataMata(participante.slug, partida.casaId, partida.fase);
      const palpitouFora = getPalpiteMataMata(participante.slug, partida.foraId, partida.fase);
      const timesPalpitados = [
        palpitouCasa ? casa?.nome : null,
        palpitouFora ? fora?.nome : null
      ].filter(Boolean);

      return (
        <div key={participante.id} className="linha-palpite">
          <span>{participante.nome}</span>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {timesPalpitados.length === 0 ? "Nenhum" : timesPalpitados.join(" e ")}
          </span>
        </div>
      );
    });
  }

  function renderPalpitesFinalizados(partida) {
    if (partida.tipoPartida === "grupos") {
      return participantes.map(participante => {
        const palpitePartida = palpites.find(p => p.partidaId === partida.id);
        const palpite = palpitePartida?.[participante.slug];

        const pontos =
          palpite && palpite[0] !== null && palpite[1] !== null
            ? calcularPontuacao(partida.golsCasa, partida.golsFora, palpite[0], palpite[1])
            : null;

        let cor = "#9ca3af";
        if (pontos === 3) cor = "#22c55e";
        if (pontos === 1) cor = "#eab308";
        if (pontos === 0) cor = "#ef4444";

        return (
          <div key={participante.id} className="linha-palpite">
            <span>{participante.nome}</span>
            <span style={{ color: cor, fontWeight: "bold" }}>
              {!palpite || palpite[0] === null || palpite[1] === null
                ? "-"
                : `${palpite[0]} x ${palpite[1]}`}
            </span>
          </div>
        );
      });
    }

    // Mata-mata finalizado: acertou o vencedor na próxima fase?
    const vencedorId =
      partida.golsCasa > partida.golsFora ? partida.casaId : partida.foraId;
    const vencedor = getSelecao(vencedorId);

    return participantes.map(participante => {
      const acertou = getPalpiteMataMata(participante.slug, vencedorId, partida.fase);

      return (
        <div key={participante.id} className="linha-palpite">
          <span>{participante.nome}</span>
          <span style={{ color: acertou ? "#22c55e" : "#ef4444", fontWeight: "bold", fontSize: "0.85rem" }}>
            {acertou ? `✓ ${vencedor?.nome}` : `✗ ${vencedor?.nome}`}
          </span>
        </div>
      );
    });
  }

  function renderCardPartida(partida, finalizada) {
    const casa = getSelecao(partida.casaId);
    const fora = getSelecao(partida.foraId);

    return (
      <div key={partida.id} className="partida-card">
        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <strong style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {partida.tipoPartida === "grupos"
              ? `Rodada ${partida.rodada} • Grupo ${partida.grupo}`
              : partida.fase}
          </strong>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {partida.horario}
          </span>
        </div>

        {/* Times e placar */}
        <div className="agenda-corpo">
          <div className="agenda-confronto">
            <div className="agenda-time">
              <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="32" />
              <strong>{casa.nome}</strong>
            </div>

            <div className="agenda-versus">
              {finalizada ? (
                <span className="placar">
                  {partida.golsCasa} x {partida.golsFora}
                </span>
              ) : (
                "x"
              )}
            </div>

            <div className="agenda-time">
              <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="32" />
              <strong>{fora.nome}</strong>
            </div>
          </div>

          {/* Palpites */}
          <div className="agenda-palpites">
            <h4 style={{ marginBottom: "10px", color: "#888" }}>Palpites</h4>
            {finalizada
              ? renderPalpitesFinalizados(partida)
              : renderPalpitesPendente(partida)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="agenda-page">
      <BotaoVoltar />

      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#22c55e" }}>
        Agenda da Copa
      </h1>

      <h2 style={{ marginBottom: "20px" }}>Próximas Partidas</h2>

      {datasPendentes.length === 0 && (
        <p style={{ color: "var(--text-secondary)" }}>Nenhuma partida pendente.</p>
      )}

      {datasPendentes.map(data => {
        const partidasData = pendentes.filter(p => p.data === data);
        return (
          <div key={data}>
            <h2 className="grupo-titulo">{data}</h2>
            <div className="grupo-jogos">
              {partidasData.map(p => renderCardPartida(p, false))}
            </div>
          </div>
        );
      })}

      <h2 style={{ marginTop: "50px", marginBottom: "20px" }}>Partidas Finalizadas</h2>

      {datasFinalizadas.length === 0 && (
        <p style={{ color: "var(--text-secondary)" }}>Nenhuma partida finalizada ainda.</p>
      )}

      {datasFinalizadas.map(data => {
        const partidasData = finalizadas.filter(p => p.data === data);
        return (
          <div key={data}>
            <h2 className="grupo-titulo">{data}</h2>
            <div className="grupo-jogos">
              {partidasData.map(p => renderCardPartida(p, true))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Agenda;