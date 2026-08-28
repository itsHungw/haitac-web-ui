import Image from 'next/image';

const PIRATE_MARKS = [
  { src: '/assets/forum/logo1.png', alt: 'Huy hiệu hải tặc đầu lâu xương chéo' },
  { src: '/assets/forum/logo2.png', alt: 'Huy hiệu hải tặc mũ đen' },
  { src: '/assets/forum/logo4.png', alt: 'Huy hiệu hải tặc bánh lái vàng' },
  { src: '/assets/forum/logo5.png', alt: 'Huy hiệu hải tặc bánh lái bạc' },
];

export function PirateMark() {
  return <div className="pirate-mark" aria-label="Bộ huy hiệu hải tặc">
    <div className="pirate-mark__logos">
      {PIRATE_MARKS.map((mark) => <Image key={mark.src} src={mark.src} width={64} height={64} alt={mark.alt} />)}
    </div>
    <span>TRUY NÃ ĐẠI HẢI TRÌNH</span>
  </div>;
}
