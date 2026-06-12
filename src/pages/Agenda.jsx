import BotaoVoltar from "../components/BotaoVoltar";
import { partidas } from "../data/partidas";
import { selecoes } from "../data/selecoes";
import "../styles/Participante.css";
import { palpites } from "../data/palpites";
import { participantes } from "../data/participantes";
import { calcularPontuacao } from "../utils/calcularPontos";
import "../styles/Agenda.css";

function Agenda() {
  const getSelecao = (id) =>
    selecoes.find(selecao => selecao.id === id);

  const partidasPendentes = partidas.filter(
  partida =>
    partida.golsCasa === null ||
    partida.golsFora === null
  );

  const partidasFinalizadas = partidas.filter(
    partida =>
      partida.golsCasa !== null &&
      partida.golsFora !== null
  );

  const datasPendentes = [
    ...new Set(
      partidasPendentes.map(partida => partida.data)
    )
  ];

  const datasFinalizadas = [
    ...new Set(
      partidasFinalizadas.map(partida => partida.data)
    )
  ];

  return (
    <div>

      <BotaoVoltar />

      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
          color: "#22c55e"
        }}
      >
        Agenda da Copa
      </h1>

      <h2
        style={{
          marginBottom: "20px"
        }}
      >
        Próximas Partidas
      </h2>

      {datasPendentes.map(data => {
        const partidasData = partidasPendentes.filter(
          partida => partida.data === data
        );

        return (
          <div key={data}>
            <h2 className="grupo-titulo">
              {data}
            </h2>

            <div className="grupo-jogos">
              {partidasData.map(partida => {
                const casa = getSelecao(partida.casaId);
                const fora = getSelecao(partida.foraId);

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
                        <strong>
                          Rodada {partida.rodada}
                        </strong>
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

                    <div className="agenda-corpo">

                      <div className="agenda-partida">

                        <div className="time-linha">
                          <img
                            src={`/flags/${casa.sigla}.png`}
                            alt={casa.nome}
                            width="28"
                            style={{ marginRight: "10px" }}
                          />

                          <strong>{casa.nome}</strong>
                        </div>

                        <div className="versus">
                          {finalizada ? (
                            <span className="placar">
                              {partida.golsCasa} x {partida.golsFora}
                            </span>
                          ) : (
                            "x"
                          )}
                        </div>

                        <div className="time-linha">
                          <img
                            src={`/flags/${fora.sigla}.png`}
                            alt={fora.nome}
                            width="28"
                            style={{ marginRight: "10px" }}
                          />

                          <strong>{fora.nome}</strong>
                        </div>

                      </div>

                      <div className="agenda-palpites">

                        <h4
                          style={{
                            marginBottom: "10px",
                            color: "#888"
                          }}
                        >
                          Palpites
                        </h4>

                        {participantes.map(participante => {
                          const palpitePartida = palpites.find(
                            p => p.partidaId === partida.id
                          );

                          const palpite =
                            palpitePartida?.[participante.slug];

                          return (
                            <div
                              key={participante.id}
                              className="linha-palpite"
                            >
                              <span>{participante.nome}</span>

                              <span>
                                {!palpite ||
                                palpite[0] === null ||
                                palpite[1] === null
                                  ? "-"
                                  : `${palpite[0]} x ${palpite[1]}`}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                    </div>
                  </div>

                );
              })}
            </div>
          </div>
        );
      })}
      <h2
        style={{
          marginTop: "50px",
          marginBottom: "20px"
        }}
      >
        Partidas Finalizadas
      </h2>

      {datasFinalizadas.map(data => {
        const partidasData =
          partidasFinalizadas.filter(
            partida => partida.data === data
          );

        return (
          <div key={data}>
            <h2 className="grupo-titulo">
              {data}
            </h2>

            <div className="grupo-jogos">
              {partidasData.map(partida => {
                const casa = getSelecao(partida.casaId);
                const fora = getSelecao(partida.foraId);

                return (
                  <div
                    key={partida.id}
                    className="partida-card"
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between"
                      }}
                    >
                      <strong>
                        Rodada {partida.rodada}
                      </strong>

                      <span>
                        {partida.horario}
                      </span>
                    </div>

                    <div className="agenda-corpo">

                      <div className="agenda-partida">

                        <div className="time-linha">
                          <img
                            src={`/flags/${casa.sigla}.png`}
                            alt={casa.nome}
                            width="28"
                            style={{ marginRight: "10px" }}
                          />
                          <strong>{casa.nome}</strong>
                        </div>

                        <div className="versus">
                          <span className="placar">
                            {partida.golsCasa} x {partida.golsFora}
                          </span>
                        </div>

                        <div className="time-linha">
                          <img
                            src={`/flags/${fora.sigla}.png`}
                            alt={fora.nome}
                            width="28"
                            style={{ marginRight: "10px" }}
                          />
                          <strong>{fora.nome}</strong>
                        </div>

                      </div>

                      <div className="agenda-palpites">

                        <h4
                          style={{
                            marginBottom: "10px",
                            color: "#888"
                          }}
                        >
                          Palpites
                        </h4>

                        {participantes.map(participante => {
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

                          let cor = "#9ca3af";

                          if (pontos === 3) cor = "#22c55e";
                          if (pontos === 1) cor = "#eab308";
                          if (pontos === 0) cor = "#ef4444";

                          return (
                            <div
                              key={participante.id}
                              className="linha-palpite"
                            >
                              <span>
                                {participante.nome}
                              </span>

                              <span
                                style={{
                                  color: cor,
                                  fontWeight: "bold"
                                }}
                              >
                                {!palpite ||
                                palpite[0] === null ||
                                palpite[1] === null
                                  ? "-"
                                  : `${palpite[0]} x ${palpite[1]}`}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Agenda;