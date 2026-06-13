import { participantes } from "../data/participantes";
import { partidas } from "../data/partidas";
import { palpites } from "../data/palpites";
import { partidasMataMata } from "../data/partidasMataMata";
import { palpitesMataMata } from "../data/palpitesMataMata";
import { calcularEstatisticasParticipante, calcularPontosMataMata } from "../utils/calcularPontos";
import { useNavigate } from "react-router-dom";

function Ranking() {
  const navigate = useNavigate();

  const rankingCalculado = participantes
    .map(participante => {
      const statsGrupos = calcularEstatisticasParticipante(
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

      const totalPontos = statsGrupos.pontos + statsMataMata.pontos;

      return {
        ...participante,
        ...statsGrupos,
        pontosMataMata: statsMataMata.pontos,
        pontos: totalPontos
      };
    })
    .sort((a, b) => {
      // 1º critério: mais pontos no total
      if (b.pontos !== a.pontos) return b.pontos - a.pontos;
      // 2º critério: mais acertos exatos
      if (b.acertosExatos !== a.acertosExatos) return b.acertosExatos - a.acertosExatos;
      // 3º critério: mais pontos no mata-mata
      return b.pontosMataMata - a.pontosMataMata;
    });

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