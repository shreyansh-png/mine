
import Intro from "./components/intro/Intro";
import ParticlePortrait from "./components/intro/ParticlePortrait";
import FirstSelfie from "./components/memories/FirstSelfie";
import JourneyTimeline from "./components/memories/JourneyTimeline";
import OctoberSeventeen from "./components/memories/Octoberseventeen";

export default function App() {
  return (
    <main>
      <Intro />
      <ParticlePortrait />
      <FirstSelfie />
      <OctoberSeventeen />
      <JourneyTimeline />
    </main>
  );
}
