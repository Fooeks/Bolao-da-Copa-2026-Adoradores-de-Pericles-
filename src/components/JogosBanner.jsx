import { useNavigate } from "react-router-dom";
import { partidas } from "../data/partidas";
import { selecoes } from "../data/selecoes";

function JogosBanner() {
  const navigate = useNavigate();

  const proximosJogos = partidas
    .filter(
      partida =>
        partida.golsCasa === null &&
        partida.golsFora === null
    )
    .sort((a, b) => a.ordem - b.ordem)
    .slice(0, 2);

  const ultimosResultados = partidas
    .filter(
      partida =>
        partida.golsCasa !== null &&
        partida.golsFora !== null
    )
    .sort((a, b) => b.ordem - a.ordem)
    .slice(0, 2);

  const getSelecao = (id) =>
    selecoes.find(selecao => selecao.id === id);

  return (
    <section
      className="jogos-banner"
      onClick={() => navigate("/agenda")}
      style={{ cursor: "pointer" }}
    >
      <div className="coluna">
        <h3>Últimos Resultados</h3>

        {ultimosResultados.length === 0 ? (
          <p>Nenhum resultado disponível</p>
        ) : (
          ultimosResultados.map(partida => {
            const casa = getSelecao(partida.casaId);
            const fora = getSelecao(partida.foraId);

            return (
              <p key={partida.id}>
                <img
                  src={`/flags/${casa.sigla}.png`}
                  alt={casa.nome}
                  width="24"
                  style={{
                    verticalAlign: "middle",
                    marginRight: "6px"
                  }}
                />

                {casa.nome} {partida.golsCasa} x {partida.golsFora} {fora.nome}

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
            );
          })
        )}
      </div>

      <div className="coluna">
        <h3>Próximos Jogos</h3>

        {proximosJogos.map(partida => {
          const casa = getSelecao(partida.casaId);
          const fora = getSelecao(partida.foraId);

          return (
            <p key={partida.id}>
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

              {" x "}

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
          );
        })}
      </div>
    </section>
  );
}

export default JogosBanner;