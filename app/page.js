import SearchPage from "./search/page";
import OsuverseMainSearchBox from '../src/components/OsuverseMainSearchBox';

export default function Home() {
  return (
    <div> 
      <h1>Osuverse</h1>
      <SearchPage />
      <OsuverseMainSearchBox />
    </div>
  );
}
