import Image from 'next/image';

interface InnerMastheadProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function InnerMasthead({ eyebrow, title, description }: InnerMastheadProps) {
  return (
    <>
      <div className="inner-masthead" aria-hidden="true">
        <Image src="/images/header.png" alt="" fill priority sizes="100vw" className="pixelated" />
      </div>
      <div className="inner-titlebar">
        <div className="page-width">
          <span className="eyebrow eyebrow--dark">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </>
  );
}
