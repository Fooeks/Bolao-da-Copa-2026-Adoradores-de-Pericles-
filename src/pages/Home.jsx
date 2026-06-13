import Header from "../components/Header";
import JogosBanner from "../components/JogosBanner";
import Ranking from "../components/Ranking";

function Home() {
  return (
    <main>
      <Header />

      <Ranking />

      <div style={{ marginTop: "30px" }}>
        <JogosBanner />
      </div>
    </main>
  );
}

export default Home;