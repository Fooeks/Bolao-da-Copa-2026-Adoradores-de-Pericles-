import { useParams } from "react-router-dom";
import { participantes } from "../data/participantes";
import { partidas } from "../data/partidas";
import { palpites } from "../data/palpites";
import { selecoes } from "../data/selecoes";
import { partidasMataMata } from "../data/partidasMataMata";
import { palpitesMataMata } from "../data/palpitesMataMata";
import { calcularEstatisticasParticipante, calcularPontuacao, calcularPontosMataMata } from "../utils/calcularPontos";
import BotaoVoltar from "../components/BotaoVoltar";
import "../styles/Participante.css";

function Participante() {
  const { id } = useParams();

  const participante = participantes.find(
    (p) => p.id === Number(id)
  );

  if (!participante) {
    return <h1>Participante não encontrado</h1>;
  }

  const estatisticas = calcularEstatisticasParticipante(
    participante.slug,
    partidas,
    palpites
  );

  const palpiteMataMata = palpitesMataMata.find(
    p => p.participante === participante.slug
  );

  const statsMataMata = palpiteMataMata
    ? calcularPontosMataMata(palpiteMataMata, partidasMataMata)
    : { pontos: 0, detalhes: {} };

  const totalPontos = estatisticas.pontos + statsMataMata.pontos;

  const getSelecao = (id) =>
    selecoes.find(selecao => selecao.id === id);

  const palpitesParticipante = [...partidas]
    .sort((a, b) => b.id - a.id)
    .map(partida => {
      const palpitePartida = palpites.find(
        p => p.partidaId === partida.id
      );

      const palpite = palpitePartida?.[participante.slug];

      const pontos =
        palpite &&
        palpite[0] !== null &&
        palpite[1] !== null
          ? calcularPontuacao(
              partida.golsCasa,
              partida.golsFora,
              palpite[0],
              palpite[1]
            )
          : null;

      return { partida, palpite, pontos };
    });

  const ultimosResultados = partidas
    .filter(
      partida =>
        partida.golsCasa !== null &&
        partida.golsFora !== null
    )
    .sort((a, b) => b.ordem - a.ordem)
    .slice(0, 2);

  const proximosJogos = partidas
    .filter(
      partida =>
        partida.golsCasa === null &&
        partida.golsFora === null
    )
    .sort((a, b) => a.ordem - b.ordem)
    .slice(0, 2);

  const partidasPorGrupo = {};
  partidas.forEach(partida => {
    if (!partidasPorGrupo[partida.grupo]) {
      partidasPorGrupo[partida.grupo] = [];
    }
    partidasPorGrupo[partida.grupo].push(partida);
  });

  // Configuração das fases do mata-mata para exibição
  const fasesMataMata = [
    { chave: "dezesseisAvos", label: "Rodada de 32",     pontosPor: 1,  nomeFase: "Rodada de 32"    },
    { chave: "oitavas",       label: "Oitavas de Final", pontosPor: 2,  nomeFase: "Oitavas de Final" },
    { chave: "quartas",       label: "Quartas de Final", pontosPor: 3,  nomeFase: "Quartas de Final" },
    { chave: "semi",          label: "Semifinais",       pontosPor: 4,  nomeFase: "Semifinal"        },
    { chave: "final",         label: "Final",            pontosPor: 5,  nomeFase: "Final"            },
  ];

  // Seleções que chegaram em cada fase (baseado em partidasMataMata)
  function getSelecoesDaFase(nomeFase) {
    const ids = new Set();
    partidasMataMata
      .filter(p => p.fase === nomeFase)
      .forEach(p => {
        if (p.casaId !== null) ids.add(p.casaId);
        if (p.foraId !== null) ids.add(p.foraId);
      });
    return ids;
  }

  // Vencedor da final
  function getCampeaoReal() {
    const final = partidasMataMata.find(p => p.fase === "Final");
    if (!final || final.golsCasa === null || final.golsFora === null) return null;
    return final.golsCasa > final.golsFora ? final.casaId : final.foraId;
  }

  const campeaoReal = getCampeaoReal();
  const faseJaTemDados = (nomeFase) => getSelecoesDaFase(nomeFase).size > 0;

  return (
    <div className="participante-page">
      <BotaoVoltar />

      <div className="participante-header">
        <img
          src={participante.avatar}
          alt={participante.nome}
          className="participante-avatar"
        />
        <h1>{participante.nome}</h1>
      </div>

      <div className="participante-stats">
        <div className="stat-card">
          <strong>Pontos</strong>
          <p>{totalPontos}</p>
        </div>

        <div className="stat-card">
          <strong>Aproveitamento</strong>
          <p>{estatisticas.aproveitamento}%</p>
        </div>

        <div className="stat-card">
          <strong>Exatos</strong>
          <p>{estatisticas.acertosExatos}</p>
        </div>

        <div className="stat-card">
          <strong>Resultado</strong>
          <p>{estatisticas.acertosResultado}</p>
        </div>

        <div className="stat-card">
          <strong>Erros</strong>
          <p>{estatisticas.erros}</p>
        </div>

        {statsMataMata.pontos > 0 && (
          <div className="stat-card">
            <strong>Mata-Mata</strong>
            <p>
              {Object.values(statsMataMata.detalhes).reduce((acc, d) => acc + d.acertos, 0)} acertos
            </p>
            <p style={{ color: "var(--green-primary)", fontWeight: "bold" }}>
              +{statsMataMata.pontos} pts
            </p>
          </div>
        )}
      </div>

      
      <div className="resumo-container">
        <div className="resumo-linha">
          <h3>Próximos Jogos</h3>

          <div className="resumo-colunas">
          {proximosJogos.map(partida => {
            const casa = getSelecao(partida.casaId);
            const fora = getSelecao(partida.foraId);

            const palpitePartida = palpites.find(
              p => p.partidaId === partida.id
            );
            const palpite = palpitePartida?.[participante.slug];

            return (
              <div key={partida.id} className="partida-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <p>
                    <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="20" style={{ verticalAlign: "middle", marginRight: "5px" }} />
                    <strong>{casa.nome}</strong>{" x "}<strong>{fora.nome}</strong>
                    <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="20" style={{ verticalAlign: "middle", marginLeft: "5px" }} />
                  </p>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {partida.horario}
                  </span>
                </div>

                <div className="linha-palpite linha-palpite-destaque">
                  <span>
                    Seu palpite:{" "}
                    <span className="placar-valor placar-valor--pendente">
                      {!palpite || palpite[0] === null || palpite[1] === null
                        ? "-"
                        : `${palpite[0]} x ${palpite[1]}`}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="resumo-linha">
          <h3>Últimos Resultados</h3>

          <div className="resumo-colunas">
          {ultimosResultados.map(partida => {
            const casa = getSelecao(partida.casaId);
            const fora = getSelecao(partida.foraId);

            const palpitePartida = palpites.find(
              p => p.partidaId === partida.id
            );
            const palpite = palpitePartida?.[participante.slug];
            const pontos =
              palpite && palpite[0] !== null && palpite[1] !== null
                ? calcularPontuacao(
                    partida.golsCasa,
                    partida.golsFora,
                    palpite[0],
                    palpite[1]
                  )
                : null;

            let cor = "var(--text-secondary)";
            if (pontos === 3) cor = "#22c55e";
            else if (pontos === 1) cor = "#eab308";
            else if (pontos === 0) cor = "#ef4444";

            return (
              <div key={partida.id} className="partida-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <p>
                    <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="20" style={{ verticalAlign: "middle", marginRight: "5px" }} />
                    <strong>{casa.nome}</strong>{" "}
                    <span className="placar">{partida.golsCasa} x {partida.golsFora}</span>
                    {" "}<strong>{fora.nome}</strong>
                    <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="20" style={{ verticalAlign: "middle", marginLeft: "5px" }} />
                  </p>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                    {partida.horario}
                  </span>
                </div>

                <div className="linha-palpite linha-palpite-destaque">
                  <span>
                    Seu palpite:{" "}
                    <span className="placar-valor" style={{ color: cor }}>
                      {!palpite || palpite[0] === null || palpite[1] === null
                        ? "-"
                        : `${palpite[0]} x ${palpite[1]}`}
                    </span>
                  </span>
                  {pontos !== null && (
                    <span className="placar-valor" style={{ color: cor }}>
                      {pontos === 3 ? "+3" : pontos === 1 ? "+1" : "+0"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      <h2>Todos os Palpites</h2>

      <div className="grupos-container">
      {Object.keys(partidasPorGrupo).map(grupo => (
        <div key={grupo} className="grupo-secao">
          <h3 className="grupo-titulo-banner">Grupo {grupo}</h3>

          <div className="grupo-jogos">
            {partidasPorGrupo[grupo].map(partida => {
              const casa = getSelecao(partida.casaId);
              const fora = getSelecao(partida.foraId);

              const palpitePartida = palpites.find(
                p => p.partidaId === partida.id
              );
              const palpite = palpitePartida?.[participante.slug];
              const pontos =
                palpite && palpite[0] !== null && palpite[1] !== null
                  ? calcularPontuacao(
                      partida.golsCasa,
                      partida.golsFora,
                      palpite[0],
                      palpite[1]
                    )
                  : null;

              const finalizada =
                partida.golsCasa !== null && partida.golsFora !== null;

              return (
                <div key={partida.id} className="partida-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <p>
                      <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="20" style={{ verticalAlign: "middle", marginRight: "5px" }} />
                      <strong>{casa.nome}</strong>
                      {finalizada ? (
                        <> {" "}<span className="placar">{partida.golsCasa} x {partida.golsFora}</span>{" "}</>
                      ) : (
                        " x "
                      )}
                      <strong>{fora.nome}</strong>
                      <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="20" style={{ verticalAlign: "middle", marginLeft: "5px" }} />
                    </p>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {partida.horario}
                    </span>
                  </div>

                  <div className="linha-palpite linha-palpite-destaque">
                    <span>
                      Seu palpite:{" "}
                      {!palpite || palpite[0] === null || palpite[1] === null ? (
                        <span className="placar-valor placar-valor--pendente">{finalizada ? "-" : "⏳"}</span>
                      ) : (
                        <span className={
                          "placar-valor " + (
                            pontos === 3 ? "texto-exato"
                            : pontos === 1 ? "texto-resultado"
                            : pontos === 0 ? "texto-erro"
                            : ""
                          )
                        }>
                          {palpite[0]} x {palpite[1]}
                        </span>
                      )}
                    </span>
                    {finalizada && pontos !== null && (
                      <span className={
                        "placar-valor " + (
                          pontos === 3 ? "texto-exato"
                          : pontos === 1 ? "texto-resultado"
                          : "texto-erro"
                        )
                      }>
                        {pontos === 3 ? "+3" : pontos === 1 ? "+1" : "+0"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      </div>

      {/* =================== MATA-MATA =================== */}
      <h2 style={{ marginTop: "40px" }}>Mata-Mata</h2>

      {palpiteMataMata ? (
        <>
          {fasesMataMata.map(({ chave, label, pontosPor, nomeFase }) => {
            const palpiteIds = palpiteMataMata[chave] || [];
            const selecoesDaFase = getSelecoesDaFase(nomeFase);
            const faseDisponivel = faseJaTemDados(nomeFase);
            const detalhe = statsMataMata.detalhes[chave];

            return (
              <div key={chave}>
                <h3 className="grupo-titulo">
                  {label}
                  <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-secondary)", marginLeft: "10px" }}>
                    +{pontosPor} pt{pontosPor > 1 ? "s" : ""} por acerto
                  </span>
                  {faseDisponivel && detalhe && (
                    <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--green-primary)", marginLeft: "10px" }}>
                      {detalhe.acertos}/{detalhe.total} acertos • +{detalhe.pontos} pts
                    </span>
                  )}
                </h3>

                <div className="grupo-jogos">
                  {palpiteIds.map(selecaoId => {
                    const selecao = getSelecao(selecaoId);
                    if (!selecao) return null;

                    const acertou = faseDisponivel
                      ? selecoesDaFase.has(selecaoId)
                      : null;

                    return (
                      <div
                        key={selecaoId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          background: "var(--bg-card)",
                          borderRadius: "8px",
                          border: `1px solid ${
                            acertou === true ? "var(--green-primary)"
                            : acertou === false ? "#ef4444"
                            : "var(--border-color)"
                          }`,
                          marginBottom: "8px"
                        }}
                      >
                        <img
                          src={`/flags/${selecao.sigla}.png`}
                          alt={selecao.nome}
                          width="24"
                          style={{ verticalAlign: "middle" }}
                        />
                        <span style={{ flex: 1 }}>{selecao.nome}</span>
                        <span>
                          {acertou === true && "🟢"}
                          {acertou === false && "🔴"}
                          {acertou === null && "⏳"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Campeão */}
          <div>
            <h3 className="grupo-titulo">
              Campeão
              <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "var(--text-secondary)", marginLeft: "10px" }}>
                +10 pts
              </span>
              {campeaoReal !== null && (
                <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--green-primary)", marginLeft: "10px" }}>
                  {palpiteMataMata.campeaoId === campeaoReal ? "+10 pts 🏆" : "0 pts"}
                </span>
              )}
            </h3>

            <div className="grupo-jogos">
              {(() => {
                const selecao = getSelecao(palpiteMataMata.campeaoId);
                if (!selecao) return null;
                const acertou = campeaoReal !== null
                  ? palpiteMataMata.campeaoId === campeaoReal
                  : null;

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      background: "var(--bg-card)",
                      borderRadius: "8px",
                      border: `1px solid ${
                        acertou === true ? "var(--green-primary)"
                        : acertou === false ? "#ef4444"
                        : "var(--border-color)"
                      }`,
                      marginBottom: "8px"
                    }}
                  >
                    <img
                      src={`/flags/${selecao.sigla}.png`}
                      alt={selecao.nome}
                      width="24"
                      style={{ verticalAlign: "middle" }}
                    />
                    <span style={{ flex: 1 }}>{selecao.nome}</span>
                    <span>
                      {acertou === true && "🏆 🟢"}
                      {acertou === false && "🔴"}
                      {acertou === null && "⏳"}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: "var(--text-secondary)" }}>
          Nenhum palpite de mata-mata registrado.
        </p>
      )}
    </div>
  );
}

export default Participante;