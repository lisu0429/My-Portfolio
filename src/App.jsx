import { useEffect } from 'react';
import Atmosphere from './components/Atmosphere.jsx';
import AuroraLayer from './components/AuroraLayer.jsx';
import TopographyLayer from './components/TopographyLayer.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Strengths from './components/Strengths.jsx';
import Contact from './components/Contact.jsx';
import { initMotion } from './motion/index.js';

export default function App() {
  useEffect(() => initMotion(), []);

  return (
    <>
      <TopographyLayer />
      <Atmosphere />
      <AuroraLayer />
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Strengths />
        <Contact />
      </main>
    </>
  );
}


