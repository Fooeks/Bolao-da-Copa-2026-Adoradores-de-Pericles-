import { NOME_BOLAO, SUBTITULO_BOLAO } from "../config/constants";

function Header() {
  return (
    <header>
      <h1>{NOME_BOLAO}</h1>
      <h2>{SUBTITULO_BOLAO}</h2>
    </header>
  );
}

export default Header;