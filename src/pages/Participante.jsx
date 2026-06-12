import { useParams } from "react-router-dom";
import { participantes } from "../data/participantes";
import { partidas } from "../data/partidas";
import { palpites } from "../data/palpites";
import { selecoes } from "../data/selecoes";
import {calcularEstatisticasParticipante, calcularPontuacao} from "../utils/calcularPontos";
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

  const getSelecao = (id) =>
    selecoes.find(selecao => selecao.id === id);

  const palpitesParticipante = [...partidas]
  .sort((a, b) => b.id - a.id)
  .map(partida => {
    const palpitePartida = palpites.find(
      p => p.partidaId === partida.id
    );

    const palpite =
      palpitePartida?.[participante.slug];

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

    return {
      partida,
      palpite,
      pontos
    };
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
    <p>{estatisticas.pontos}</p>
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

              const palpite =
                palpitePartida?.[participante.slug];

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

              return (
                <div
                  key={partida.id}
                  className="partida-card"
                >
                  <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <p>
                    <img
                      src={`/flags/${casa.sigla}.png`}
                      alt={casa.nome}
                      width="24"
                      style={{
                        verticalAlign: "middle",
                        marginRight: "6px"
                      }}
                    />

                    {casa.nome}

                    {" "}
                    <span className="placar">
                      {partida.golsCasa} x {partida.golsFora}
                    </span>
                    {" "}

                    {fora.nome}

                    <img
                      src={`/flags/${fora.sigla}.png`}
                      alt={fora.nome}
                      width="24"
                      style={{
                        verticalAlign: "middle",
                        marginLeft: "6px"
                      }}
                    />
                  </p>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)"
                    }}
                  >
                    {partida.data} - {partida.horario}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "24px"
                  }}
                >
                  <p>
                  <>
                    Palpite:{" "}
                    <span
                      className={
                        pontos === 3
                          ? "placar-exato"
                          : pontos === 1
                          ? "placar-resultado"
                          : pontos === 0
                          ? "placar-erro"
                          : "placar-pendente"
                      }
                    >
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

              const palpite =
                palpitePartida?.[participante.slug];

              return (
                <div
                  key={partida.id}
                  className="partida-card"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                  <p>
                    <img
                      src={`/flags/${casa.sigla}.png`}
                      alt={casa.nome}
                      width="24"
                      style={{
                        verticalAlign: "middle",
                        marginRight: "6px"
                      }}
                    />

                    {casa.nome}

                    {" "}x{" "}

                    {fora.nome}

                    <img
                      src={`/flags/${fora.sigla}.png`}
                      alt={fora.nome}
                      width="24"
                      style={{
                        verticalAlign: "middle",
                        marginLeft: "6px"
                      }}
                    />
                  </p>

                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)"
                    }}
                  >
                    {partida.data} - {partida.horario}
                  </p>
                </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "24px"
                    }}
                  >
                    <p>
                      {!palpite ||
                      palpite[0] === null ||
                      palpite[1] === null ? (
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
            <h3 className="grupo-titulo">
              Grupo {grupo}
            </h3>

            <div className="grupo-jogos">
              {partidasPorGrupo[grupo].map(partida => {
                const casa = getSelecao(partida.casaId);
                const fora = getSelecao(partida.foraId);

                const palpitePartida = palpites.find(
                  p => p.partidaId === partida.id
                );

                const palpite =
                  palpitePartida?.[participante.slug];

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

                const finalizada =
                  partida.golsCasa !== null &&
                  partida.golsFora !== null;

                return (
                  <div
                    key={partida.id}
                    className="partida-card"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px"
                      }}
                    >
                      <p>
                        <img
                          src={`/flags/${casa.sigla}.png`}
                          alt={casa.nome}
                          width="24"
                          style={{
                            verticalAlign: "middle",
                            marginRight: "6px"
                          }}
                        />

                        {casa.nome}

                        {finalizada ? (
                          <>
                            {" "}
                            <span className="placar">
                              {partida.golsCasa} x {partida.golsFora}
                            </span>
                            {" "}
                          </>
                        ) : (
                          " x "
                        )}

                        {fora.nome}

                        <img
                          src={`/flags/${fora.sigla}.png`}
                          alt={fora.nome}
                          width="24"
                          style={{
                            verticalAlign: "middle",
                            marginLeft: "6px"
                          }}
                        />
                      </p>

                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#666"
                        }}
                      >
                        {partida.data} - {partida.horario}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "24px"
                      }}
                    >
                      {!palpite ||
                      palpite[0] === null ||
                      palpite[1] === null ? (
                        <p>Sem palpite enviado</p>
                      ) : (
                        <p>
                        <>
                          Palpite:{" "}
                          <span
                            className={
                              pontos === 3
                                ? "placar-exato"
                                : pontos === 1
                                ? "placar-resultado"
                                : pontos === 0
                                ? "placar-erro"
                                : "placar-pendente"
                            }
                          >
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
    </div>
  );
}

export default Participante;