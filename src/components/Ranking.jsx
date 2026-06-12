import { participantes } from "../data/participantes";
import { partidas } from "../data/partidas";
import { palpites } from "../data/palpites";
import { calcularEstatisticasParticipante } from "../utils/calcularPontos";
import { useNavigate } from "react-router-dom";

function Ranking() {
  const navigate = useNavigate();

  const rankingCalculado = participantes
    .map(participante => ({
      ...participante,
      ...calcularEstatisticasParticipante(
        participante.slug,
        partidas,
        palpites
      )
    }))
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <section className="ranking">
      <h2>Ranking</h2>

      {rankingCalculado.map((participante, index) => (
        <div
          key={participante.id}
          className="participante"
          onClick={() => navigate(`/participante/${participante.id}`)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <img
              src={participante.avatar}
              alt={participante.nome}
              width="40"
              height="40"
              style={{
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />

            <span>
              {index + 1}º {participante.nome}
            </span>
          </div>

          <span>
            {participante.pontos} pts | {participante.aproveitamento}%
          </span>
        </div>
      ))}
    </section>
  );
}

export default Ranking;