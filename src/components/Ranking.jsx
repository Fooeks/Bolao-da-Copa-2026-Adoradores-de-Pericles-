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
    })
    // Atribui a colocação considerando empates em todos os critérios de desempate
    .reduce((acc, participante, index) => {
      if (index === 0) {
        acc.push({ ...participante, posicao: 1 });
        return acc;
      }

      const anterior = acc[index - 1];
      const empatado =
        participante.pontos === anterior.pontos &&
        participante.acertosExatos === anterior.acertosExatos &&
        participante.pontosMataMata === anterior.pontosMataMata;

      acc.push({
        ...participante,
        posicao: empatado ? anterior.posicao : index + 1
      });
      return acc;
    }, []);

  return (
    <section className="ranking">
      <h2>Ranking</h2>

      {rankingCalculado.map((participante) => (
        <div
          key={participante.id}
          className={`ranking-item ${
            participante.posicao === 1
              ? "ranking-item--ouro"
              : participante.posicao === 2
              ? "ranking-item--prata"
              : participante.posicao === 3
              ? "ranking-item--bronze"
              : ""
          }`}
          onClick={() => navigate(`/participante/${participante.id}`)}
        >
          <div className="ranking-item__info">
            <span className="ranking-item__posicao">{participante.posicao}º</span>

            <img
              src={participante.avatar}
              alt={participante.nome}
              className="ranking-item__avatar"
              width="40"
              height="40"
            />

            <span className="ranking-item__nome">{participante.nome}</span>
          </div>

          <div className="ranking-item__stats">
            <span className="ranking-item__aproveitamento">
              {participante.aproveitamento}%
            </span>
            <span className="ranking-item__pontos">
              {participante.pontos}
              <small>pts</small>
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}

export default Ranking;