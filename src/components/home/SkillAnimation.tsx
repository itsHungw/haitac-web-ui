export type SkillEffect = 'fist' | 'guard' | 'rage' | 'dash' | 'slash' | 'storm' | 'bullet' | 'burst' | 'bomb' | 'arrow' | 'frost' | 'rain' | 'cleave' | 'quake' | 'finisher';

interface SkillAnimationProps {
  effect: SkillEffect;
  accent: string;
  name: string;
}

export function SkillAnimation({ effect, accent, name }: SkillAnimationProps) {
  return (
    <div className={`skill-animation effect--${effect}`} style={{ '--effect-color': accent } as React.CSSProperties} role="img" aria-label={`Minh họa animation kỹ năng ${name}`}>
      <div className="skill-animation__grid" aria-hidden="true" />
      <div className="skill-fighter skill-fighter--caster" aria-hidden="true"><span /></div>
      <div className="skill-fighter skill-fighter--target" aria-hidden="true"><span /></div>
      <span className="skill-effect skill-effect--one" aria-hidden="true" />
      <span className="skill-effect skill-effect--two" aria-hidden="true" />
      <span className="skill-effect skill-effect--three" aria-hidden="true" />
      <span className="skill-effect skill-effect--four" aria-hidden="true" />
      <span className="skill-impact" aria-hidden="true" />
      <span className="skill-floor" aria-hidden="true" />
    </div>
  );
}
