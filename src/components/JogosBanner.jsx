import { useNavigate } from "react-router-dom";
import { partidas } from "../data/partidas";
import { partidasMataMata } from "../data/partidasMataMata";
import { selecoes } from "../data/selecoes";
import { participantes } from "../data/participantes";
import { palpites } from "../data/palpites";
import { palpitesMataMata } from "../data/palpitesMataMata";

function JogosBanner() {
  const navigate = useNavigate();

  // Junta todas as partidas (grupos + mata-mata) e separa por status
  const todasPartidas = [
    ...partidas.map(p => ({ ...p, tipoPartida: "grupos" })),
    ...partidasMataMata.map(p => ({ ...p, tipoPartida: "mataMata" }))
  ];

  const proximosJogos = todasPartidas
    .filter(p =>
      p.golsCasa === null &&
      p.golsFora === null &&
      // Para mata-mata, só mostra se os times já estão definidos
      (p.tipoPartida === "grupos" || (p.casaId !== null && p.foraId !== null))
    )
    .sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.horario}`);
      const dtB = new Date(`${b.data}T${b.horario}`);
      return dtA - dtB;
    })
    .slice(0, 2);

  const ultimosResultados = todasPartidas
    .filter(p =>
      p.golsCasa !== null &&
      p.golsFora !== null
    )
    .sort((a, b) => {
      const dtA = new Date(`${a.data}T${a.horario}`);
      const dtB = new Date(`${b.data}T${b.horario}`);
      return dtB - dtA;
    })
    .slice(0, 2);

  const getSelecao = (id) =>
    selecoes.find(s => s.id === id);

  // Para mata-mata: verifica se participante palpitou uma seleção na próxima fase
  function getPalpiteMataMata(participanteSlug, selecaoId, faseAtual) {
    const palpite = palpitesMataMata.find(p => p.participante === participanteSlug);
    if (!palpite) return null;

    // A "próxima fase" após cada etapa
    const proximaFase = {
      "Rodada de 32":    "oitavas",
      "Oitavas de Final": "quartas",
      "Quartas de Final": "semi",
      "Semifinal":        "final",
      "Final":            "campeao"
    };

    const chaveProxima = proximaFase[faseAtual];
    if (!chaveProxima) return null;

    if (chaveProxima === "campeao") {
      return palpite.campeaoId === selecaoId ? "palpitou" : "nao-palpitou";
    }

    const ids = palpite[chaveProxima] || [];
    return ids.includes(selecaoId) ? "palpitou" : "nao-palpitou";
  }

  function renderPalpitesPartida(partida) {
    return participantes.map(participante => {
      if (partida.tipoPartida === "grupos") {
        // Fase de grupos: mostra o placar palpitado
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
      } else {
        // Mata-mata: mostra quais dos dois times o participante palpitou na próxima fase
        const casa = getSelecao(partida.casaId);
        const fora = getSelecao(partida.foraId);

        const palpitouCasa = getPalpiteMataMata(participante.slug, partida.casaId, partida.fase);
        const palpitouFora = getPalpiteMataMata(participante.slug, partida.foraId, partida.fase);

        const timesPalpitados = [
          palpitouCasa === "palpitou" ? casa?.nome : null,
          palpitouFora === "palpitou" ? fora?.nome : null
        ].filter(Boolean);

        return (
          <div key={participante.id} className="linha-palpite">
            <span>{participante.nome}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {timesPalpitados.length === 0
                ? "Nenhum"
                : timesPalpitados.join(" e ")}
            </span>
          </div>
        );
      }
    });
  }

  function renderPalpitesFinalizados(partida) {
    return participantes.map(participante => {
      if (partida.tipoPartida === "grupos") {
        const palpitePartida = palpites.find(p => p.partidaId === partida.id);
        const palpite = palpitePartida?.[participante.slug];

        // Calcula acerto
        let cor = "var(--text-secondary)";
        if (palpite && palpite[0] !== null && palpite[1] !== null) {
          const resultadoReal =
            partida.golsCasa > partida.golsFora ? "casa"
            : partida.golsCasa < partida.golsFora ? "fora"
            : "empate";
          const resultadoPalpite =
            palpite[0] > palpite[1] ? "casa"
            : palpite[0] < palpite[1] ? "fora"
            : "empate";
          const exato =
            palpite[0] === partida.golsCasa && palpite[1] === partida.golsFora;

          if (exato) cor = "#22c55e";
          else if (resultadoReal === resultadoPalpite) cor = "#eab308";
          else cor = "#ef4444";
        }

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
      } else {
        // Mata-mata finalizado: mostra se o participante palpitou o vencedor na próxima fase
        const vencedorId =
          partida.golsCasa > partida.golsFora
            ? partida.casaId
            : partida.foraId;
        const vencedor = getSelecao(vencedorId);

        const palpitouVencedor =
          getPalpiteMataMata(participante.slug, vencedorId, partida.fase) === "palpitou";

        return (
          <div key={participante.id} className="linha-palpite">
            <span>{participante.nome}</span>
            <span style={{
              color: palpitouVencedor ? "#22c55e" : "#ef4444",
              fontWeight: "bold",
              fontSize: "0.85rem"
            }}>
              {palpitouVencedor
                ? `✓ ${vencedor?.nome}`
                : `✗ ${vencedor?.nome}`}
            </span>
          </div>
        );
      }
    });
  }

  function renderPartidaCard(partida, finalizada) {
    const casa = getSelecao(partida.casaId);
    const fora = getSelecao(partida.foraId);

    return (
      <div key={partida.id} className="partida-card" style={{ marginBottom: "12px" }}>
        {/* Fase (só para mata-mata) */}
        {partida.tipoPartida === "mataMata" && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
            {partida.fase}
          </p>
        )}

        {/* Placar / Times */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <p>
            <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="20" style={{ verticalAlign: "middle", marginRight: "5px" }} />
            {casa.nome}
            {finalizada ? (
              <> {" "}<span className="placar">{partida.golsCasa} x {partida.golsFora}</span>{" "}</>
            ) : (
              " x "
            )}
            {fora.nome}
            <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="20" style={{ verticalAlign: "middle", marginLeft: "5px" }} />
          </p>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {partida.horario}
          </span>
        </div>

        {/* Palpites */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
          {finalizada
            ? renderPalpitesFinalizados(partida)
            : renderPalpitesPartida(partida)}
        </div>
      </div>
    );
  }

  return (
    <section
      className="jogos-banner"
      onClick={() => navigate("/agenda")}
      style={{ cursor: "pointer" }}
    >
      <div className="linha-jogos">
        <h3>Próximos Jogos</h3>
        <div className="colunas-jogos">
          {proximosJogos.length === 0 ? (
            <p>Nenhum jogo agendado</p>
          ) : (
            proximosJogos.map(p => renderPartidaCard(p, false))
          )}
        </div>
      </div>

      <div className="linha-jogos">
        <h3>Últimos Resultados</h3>
        <div className="colunas-jogos">
          {ultimosResultados.length === 0 ? (
            <p>Nenhum resultado disponível</p>
          ) : (
            ultimosResultados.map(p => renderPartidaCard(p, true))
          )}
        </div>
      </div>
    </section>
  );
}

export default JogosBanner;