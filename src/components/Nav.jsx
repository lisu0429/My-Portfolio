import { useEffect, useState } from 'react';
import s from './Nav.module.css';
import { profile } from '../data/profile.js';

const links = [
  { id: 'about', label: '经历' },
  { id: 'work', label: '项目' },
  { id: 'strengths', label: '优势' },
  { id: 'contact', label: '联系' },
];

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((sec) => io.observe(sec));
    return () => io.disconnect();
  }, []);

  return (
    <header className={`${s.nav} ${solid ? s.solid : ''}`} data-anim="nav">
      <div className={s.inner}>
        <a href="#top" className={s.brand} aria-label={`${profile.name} 首页`} data-anim="nav-part">
          <span className={s.mark}>李</span>
          <span className={s.brandText}>
            <strong>{profile.name}</strong>
            <em>LI BIN · AI PRODUCT MANAGER</em>
          </span>
        </a>

        <nav className={s.links} aria-label="主导航">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`${s.link} ${active === l.id ? s.active : ''}`}
              data-anim="nav-part"
            >
              <span className={s.linkIndex}>0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className={s.cta} data-anim="nav-part">
          联系我
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path
              d="M3 13 13 3M6 3h7v7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="square"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}
