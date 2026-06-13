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

      <h2>Resumo dos Palpites</h2>

      <div className="resumo-container">
        <div className="resumo-coluna">
          <h3>Últimos Resultados</h3>

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

            return (
              <div key={partida.id} className="partida-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <p>
                    <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="24" style={{ verticalAlign: "middle", marginRight: "6px" }} />
                    {casa.nome}{" "}
                    <span className="placar">{partida.golsCasa} x {partida.golsFora}</span>
                    {" "}{fora.nome}
                    <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="24" style={{ verticalAlign: "middle", marginLeft: "6px" }} />
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    {partida.data} - {partida.horario}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                  <p>
                    <>
                      Palpite:{" "}
                      <span className={
                        pontos === 3 ? "placar-exato"
                        : pontos === 1 ? "placar-resultado"
                        : pontos === 0 ? "placar-erro"
                        : "placar-pendente"
                      }>
                        {palpite[0]} x {palpite[1]}
                      </span>
                    </>
                  </p>
                  <p>
                    {pontos === 3 && "🟢 +3"}
                    {pontos === 1 && "🟡 +1"}
                    {pontos === 0 && "🔴 0"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="resumo-coluna">
          <h3>Próximos Jogos</h3>

          {proximosJogos.map(partida => {
            const casa = getSelecao(partida.casaId);
            const fora = getSelecao(partida.foraId);

            const palpitePartida = palpites.find(
              p => p.partidaId === partida.id
            );
            const palpite = palpitePartida?.[participante.slug];

            return (
              <div key={partida.id} className="partida-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <p>
                    <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="24" style={{ verticalAlign: "middle", marginRight: "6px" }} />
                    {casa.nome}{" x "}{fora.nome}
                    <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="24" style={{ verticalAlign: "middle", marginLeft: "6px" }} />
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    {partida.data} - {partida.horario}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                  <p>
                    {!palpite || palpite[0] === null || palpite[1] === null ? (
                      "Sem palpite"
                    ) : (
                      <>
                        Palpite:{" "}
                        <span className="placar-palpite">
                          {palpite[0]} x {palpite[1]}
                        </span>
                      </>
                    )}
                  </p>
                  <p>⏳</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2>Todos os Palpites</h2>

      {Object.keys(partidasPorGrupo).map(grupo => (
        <div key={grupo}>
          <h3 className="grupo-titulo">Grupo {grupo}</h3>

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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <p>
                      <img src={`/flags/${casa.sigla}.png`} alt={casa.nome} width="24" style={{ verticalAlign: "middle", marginRight: "6px" }} />
                      {casa.nome}
                      {finalizada ? (
                        <> {" "}<span className="placar">{partida.golsCasa} x {partida.golsFora}</span>{" "}</>
                      ) : (
                        " x "
                      )}
                      {fora.nome}
                      <img src={`/flags/${fora.sigla}.png`} alt={fora.nome} width="24" style={{ verticalAlign: "middle", marginLeft: "6px" }} />
                    </p>
                    <p style={{ fontSize: "0.9rem", color: "#666" }}>
                      {partida.data} - {partida.horario}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                    {!palpite || palpite[0] === null || palpite[1] === null ? (
                      <p>Sem palpite enviado</p>
                    ) : (
                      <p>
                        <>
                          Palpite:{" "}
                          <span className={
                            pontos === 3 ? "placar-exato"
                            : pontos === 1 ? "placar-resultado"
                            : pontos === 0 ? "placar-erro"
                            : "placar-pendente"
                          }>
                            {palpite[0]} x {palpite[1]}
                          </span>
                        </>
                      </p>
                    )}
                    {finalizada && pontos !== null ? (
                      <p>
                        {pontos === 3 && "🟢 +3"}
                        {pontos === 1 && "🟡 +1"}
                        {pontos === 0 && "🔴 0"}
                      </p>
                    ) : (
                      <p>⏳</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

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