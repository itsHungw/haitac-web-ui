'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SkillAnimation, type SkillEffect } from './SkillAnimation';

interface ClassSkill {
  name: string;
  type: string;
  description: string;
  effect: SkillEffect;
  icon?: string;
  gif?: string;
}

interface CharacterClass {
  id: string;
  name: string;
  role: string;
  weapon: string;
  description: string;
  accent: string;
  characterImage: string;
  skills: ClassSkill[];
}

const CHARACTER_CLASSES: CharacterClass[] = [
  {
    id: 'kiem-si',
    name: 'Kiếm Sĩ',
    role: 'CÔNG KÍCH · CƠ ĐỘNG',
    weapon: 'Trường kiếm',
    accent: '#7f9b45',
    characterImage: '/assets/characters/zoro.jpg',
    description: 'Di chuyển sắc bén, nối liền các nhát chém uy lực và kết liễu mục tiêu trong chớp mắt.',
    skills: [
      {
        name: 'Nhất kiếm',
        type: 'Trảm kích · Tấn công cơ bản',
        description: 'Vung kiếm tung ba đường trảm khí chuẩn xác xé toạc mục tiêu phía trước.',
        effect: 'dash',
        icon: '/images/skills/kiem-si/skill-1.png',
        gif: '/images/skills/kiem-si/skill-1.gif',
      },
      {
        name: 'Nhị trảm',
        type: 'Song kiếm · Đột phá',
        description: 'Xuất song kiếm trảm hình chữ X tạo xung lực áp đảo chém xuyên hàng thủ đối phương.',
        effect: 'slash',
        icon: '/images/skills/kiem-si/skill-2.png',
        gif: '/images/skills/kiem-si/skill-2.gif',
      },
      {
        name: 'Vòi rồng',
        type: 'Lốc xoáy kiếm · Diện rộng',
        description: 'Xoay kiếm tạo cơn bão lốc xoáy cuốn phăng và hất tung toàn bộ kẻ địch trong phạm vi.',
        effect: 'storm',
        icon: '/images/skills/kiem-si/skill-3.png',
        gif: '/images/skills/kiem-si/skill-3.gif',
      },
    ],
  },
  {
    id: 'xa-thu',
    name: 'Xạ Thủ',
    role: 'TẦM XA · BỘC PHÁ',
    weapon: 'Song súng hỏa mai',
    accent: '#c88b35',
    characterImage: '/assets/characters/usop.jpg',
    description: 'Bậc thầy tác chiến tầm xa, kiểm soát cự ly an toàn và dội hỏa lực bùng nổ lên chiến trường.',
    skills: [
      {
        name: 'Double Shot',
        type: 'Súng đôi · Tấn công nhanh',
        description: 'Rút song súng khai hỏa chuẩn xác với tốc độ cao, xuyên thẳng qua hàng phòng thủ đối phương.',
        effect: 'bullet',
        icon: '/images/skills/xa-thu/skill-1.png',
        gif: '/images/skills/xa-thu/skill-1.gif',
      },
      {
        name: 'Quả cầu lửa',
        type: 'Hỏa đạn · Bộc phá',
        description: 'Nạp đạn đặc chế bắn liên hồi, kích nổ tia lửa bốc cháy dữ dội tại điểm va chạm.',
        effect: 'burst',
        icon: '/images/skills/xa-thu/skill-2.png',
        gif: '/images/skills/xa-thu/skill-2.gif',
      },
      {
        name: 'Pháo hoa',
        type: 'Đạn chùm · Diện rộng',
        description: 'Phóng chùm pháo hoa phát nổ rực rỡ diện rộng, tạo mưa hỏa lực thiêu đốt toàn bộ kẻ địch.',
        effect: 'bomb',
        icon: '/images/skills/xa-thu/skill-3.png',
        gif: '/images/skills/xa-thu/skill-3.gif',
      },
    ],
  },
  {
    id: 'vo-si',
    name: 'Võ Sĩ',
    role: 'CẬN CHIẾN · CHỊU ĐÒN',
    weapon: 'Song quyền',
    accent: '#d94b3d',
    characterImage: '/assets/characters/luffy.jpg',
    description: 'Áp sát dũng mãnh, chống chịu phi thường và càng nguy hiểm khi trận đấu kéo dài.',
    skills: [
      {
        name: 'Quả đấm tốc độ',
        type: 'Cận chiến · Tốc độ',
        description: 'Dồn toàn lực vào nắm đấm tốc độ cao tạo cú chấn động thẳng vào mục tiêu.',
        effect: 'fist',
        icon: '/images/skills/vo-si/skill-1.png',
        gif: '/images/skills/vo-si/skill-1.gif',
      },
      {
        name: 'Bazooka',
        type: 'Đẩy lùi · Bộc phá',
        description: 'Kéo căng hai cánh tay phóng thẳng về phía trước đẩy lùi mọi kẻ cản đường.',
        effect: 'guard',
        icon: '/images/skills/vo-si/skill-2.png',
        gif: '/images/skills/vo-si/skill-2.gif',
      },
      {
        name: 'Liên hoàn cú đấm',
        type: 'Liên kích · Cường hóa',
        description: 'Tung ra hàng trăm cú đấm dồn dập áp đảo toàn diện đối thủ.',
        effect: 'rage',
        icon: '/images/skills/vo-si/skill-3.png',
        gif: '/images/skills/vo-si/skill-3.gif',
      },
    ],
  },
  {
    id: 'dau-bep',
    name: 'Đầu Bếp',
    role: 'CƯỜNG CƯỚC · LIÊN HOÀN',
    weapon: 'Hắc cước',
    accent: '#438fc5',
    characterImage: '/assets/characters/sanji.jpg',
    description: 'Bộ pháp thoăn thoắt, những cú đá rực lửa xé toạc không khí với tốc độ chóng mặt.',
    skills: [
      {
        name: 'Hắc cước',
        type: 'Cước pháp cơ bản',
        description: 'Tung cú đá sấm sét mang theo hỏa lực áp đảo hàng ngũ đối phương.',
        effect: 'cleave',
        icon: '/images/skills/dau-bep/skill-1.png',
        gif: '/images/skills/dau-bep/skill-1.gif',
      },
      {
        name: 'Knock out',
        type: 'Đoạt mạng · Đột kích',
        description: 'Cú đá xoay người dứt điểm với uy lực cực mạnh khiến mục tiêu choáng váng.',
        effect: 'fist',
        icon: '/images/skills/dau-bep/skill-2.png',
        gif: '/images/skills/dau-bep/skill-2.gif',
      },
      {
        name: 'Thịt băm',
        type: 'Liên hoàn cước',
        description: 'Chuỗi liên hoàn cước dồn dập vào điểm yếu của kẻ địch không thể chống đỡ.',
        effect: 'finisher',
        icon: '/images/skills/dau-bep/skill-3.png',
        gif: '/images/skills/dau-bep/skill-3.gif',
      },
    ],
  },
  {
    id: 'hoa-tieu',
    name: 'Hoa Tiêu',
    role: 'KHỐNG CHẾ · PHÉP THUẬT',
    weapon: 'Gậy thời tiết',
    accent: '#d7739a',
    characterImage: '/assets/characters/nami.jpg',
    description: 'Điều khiển sấm sét, lốc xoáy và khí hậu biển cả để khống chế toàn bộ cục diện trận đấu.',
    skills: [
      {
        name: 'Gậy chong chóng',
        type: 'Gió lốc · Tầm xa',
        description: 'Xoay gậy tạo luồng gió sắc lẹm phóng thẳng về phía đối phương.',
        effect: 'arrow',
        icon: '/images/skills/hoa-tieu/skill-1.png',
        gif: '/images/skills/hoa-tieu/skill-1.gif',
      },
      {
        name: 'Bong bóng tích điện',
        type: 'Sấm sét · Tê liệt',
        description: 'Thả các bong bóng tích điện tĩnh lơ lửng phóng điện giật đối thủ trong tầm.',
        effect: 'frost',
        icon: '/images/skills/hoa-tieu/skill-2.png',
        gif: '/images/skills/hoa-tieu/skill-2.gif',
      },
      {
        name: 'Bão sấm',
        type: 'Bão sét · Diện rộng',
        description: 'Triệu hồi đám mây đen giáng sét hàng loạt quét sạch toàn bộ chiến trường.',
        effect: 'rain',
        icon: '/images/skills/hoa-tieu/skill-3.png',
        gif: '/images/skills/hoa-tieu/skill-3.gif',
      },
    ],
  },
];

export function ClassShowcase() {
  const [activeClassIndex, setActiveClassIndex] = useState(0);
  const [activeSkillIndex, setActiveSkillIndex] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const activeClass = CHARACTER_CLASSES[activeClassIndex];
  const activeSkill = activeClass.skills[activeSkillIndex];

  function selectClass(index: number) {
    setActiveClassIndex(index);
    setActiveSkillIndex(0);
    setReplayKey((key) => key + 1);
  }

  function selectSkill(index: number) {
    setActiveSkillIndex(index);
    setReplayKey((key) => key + 1);
  }

  function stepClass(direction: number) {
    const nextIndex = (activeClassIndex + direction + CHARACTER_CLASSES.length) % CHARACTER_CLASSES.length;
    selectClass(nextIndex);
  }

  return (
    <section id="nhan-vat" className="classes-section classes-section--expanded">
      <div className="page-width section-heading section-heading--light">
        <div>
          <span className="eyebrow">NGŨ ĐẠI CHIẾN PHÁI</span>
          <h2>Chọn class, xem chiêu thức</h2>
        </div>
        <p>Mỗi chiến phái sở hữu bộ kỹ năng đặc trưng. Chạm vào từng skill để xem video thi triển chiêu thức chân thực.</p>
      </div>

      <div className="page-width class-lab" style={{ '--class-accent': activeClass.accent } as React.CSSProperties}>
        <div className="class-selector" role="tablist" aria-label="Chọn class nhân vật">
          {CHARACTER_CLASSES.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={activeClassIndex === index}
              aria-controls="class-showcase-panel"
              className={activeClassIndex === index ? 'is-active' : ''}
              onClick={() => selectClass(index)}
              style={{ '--tab-accent': item.accent } as React.CSSProperties}
            >
              <span className="class-selector__portrait" aria-hidden="true">
                <Image
                  src={item.characterImage}
                  alt=""
                  fill
                  sizes="(max-width: 560px) 20vw, (max-width: 820px) 130px, 240px"
                />
              </span>
              <span className="class-selector__index">0{index + 1}</span>
              <strong>{item.name}</strong>
              <small>{item.weapon}</small>
            </button>
          ))}
        </div>

        <div className="class-mobile-summary" aria-live="polite">
          <button type="button" onClick={() => stepClass(-1)} aria-label="Xem class trước">‹</button>
          <div>
            <span>CLASS 0{activeClassIndex + 1} / 05 · {activeClass.role}</span>
            <h3>{activeClass.name}</h3>
            <p>{activeClass.description}</p>
          </div>
          <button type="button" onClick={() => stepClass(1)} aria-label="Xem class tiếp theo">›</button>
        </div>

        <div id="class-showcase-panel" className="class-lab__body" role="tabpanel">
          <div id="skill-preview-panel" className="skill-preview" role="tabpanel">
            <div className="skill-preview__topline">
              <span>MINH HỌA KỸ NĂNG {activeSkill.gif ? '• VIDEO GAMEPLAY' : ''}</span>
              <button type="button" onClick={() => setReplayKey((key) => key + 1)}>PHÁT LẠI ↻</button>
            </div>

            {/* Video / GIF preview or animated fallback */}
            {activeSkill.gif ? (
              <div
                key={`${activeClass.id}-${activeSkillIndex}-${replayKey}`}
                style={{
                  position: 'relative',
                  minHeight: '340px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'radial-gradient(circle at 50% 50%, #0d2847 0%, #061b31 100%)',
                  overflow: 'hidden',
                  borderBottom: '3px solid var(--wood-950)',
                }}
              >
                {/* Scanline & ambient grid */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none',
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${activeSkill.gif}?k=${replayKey}`}
                  alt={`Hoạt họa kỹ năng ${activeSkill.name}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))',
                    imageRendering: 'pixelated',
                  }}
                />
              </div>
            ) : (
              <SkillAnimation
                key={`${activeClassIndex}-${activeSkillIndex}-${replayKey}`}
                effect={activeSkill.effect}
                accent={activeClass.accent}
                name={activeSkill.name}
              />
            )}

            <div className="skill-preview__caption" aria-live="polite">
              <span>{activeSkill.type}</span>
              <strong>{activeSkill.name}</strong>
              <p>{activeSkill.description}</p>
            </div>
          </div>

          <div className="class-dossier">
            <span className="class-dossier__role">{activeClass.role}</span>
            <h3>{activeClass.name}</h3>
            <p>{activeClass.description}</p>
            <div className="class-dossier__weapon">
              <span>VŨ KHÍ ĐẶC TRƯNG</span>
              <strong>{activeClass.weapon}</strong>
            </div>

            <div className="skill-list" role="tablist" aria-label={`Kỹ năng class ${activeClass.name}`}>
              {activeClass.skills.map((skill, index) => (
                <button
                  key={skill.name}
                  type="button"
                  role="tab"
                  aria-selected={activeSkillIndex === index}
                  aria-controls="skill-preview-panel"
                  className={activeSkillIndex === index ? 'is-active' : ''}
                  onClick={() => selectSkill(index)}
                  style={{
                    paddingLeft: skill.icon ? '58px' : undefined,
                  }}
                >
                  {skill.icon ? (
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '36px',
                        height: '36px',
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '6px',
                        background: activeSkillIndex === index ? 'var(--wood-950)' : '#e2e7ef',
                        border: '2px solid var(--wood-950)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                      }}
                    >
                      <Image
                        src={skill.icon}
                        alt={skill.name}
                        width={28}
                        height={28}
                        className="pixelated"
                        style={{ objectFit: 'contain' }}
                      />
                    </span>
                  ) : null}
                  <span>SKILL 0{index + 1}</span>
                  <strong>{skill.name}</strong>
                  <small>{skill.type}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
