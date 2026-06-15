import { NOME_BOLAO, SUBTITULO_BOLAO } from "../config/constants";

function Header() {
  return (
    <header>
      <div className="header-titulo">
        <img src="/avatares/dogecopa.png" alt="Mascote do bolão" className="header-mascote" />
        <h1>{NOME_BOLAO}</h1>
      </div>
      <h2>{SUBTITULO_BOLAO}</h2>
    </header>
  );
}

export default Header;