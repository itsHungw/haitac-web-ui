'use client';

import { useState } from 'react';
import { SkillAnimation, type SkillEffect } from './SkillAnimation';

interface ClassSkill {
  name: string;
  type: string;
  description: string;
  effect: SkillEffect;
}

interface CharacterClass {
  name: string;
  role: string;
  weapon: string;
  description: string;
  accent: string;
  skills: ClassSkill[];
}

const CHARACTER_CLASSES: CharacterClass[] = [
  {
    name: 'Đánh Tay', role: 'CẬN CHIẾN · CHỊU ĐÒN', weapon: 'Song quyền', accent: '#ef5a3c',
    description: 'Áp sát đối thủ, chống chịu tốt và càng nguy hiểm khi trận chiến kéo dài.',
    skills: [
      { name: 'Hải Chấn Quyền', type: 'Sát thương đơn', description: 'Dồn lực vào nắm đấm và tạo cú chấn động thẳng vào mục tiêu.', effect: 'fist' },
      { name: 'Thiết Sơn Công', type: 'Phòng thủ', description: 'Giữ vững thế đứng, hấp thụ đòn đánh rồi phản công ở cự ly gần.', effect: 'guard' },
      { name: 'Bạo Khí', type: 'Cường hóa', description: 'Bùng nổ khí lực, tăng nhịp tấn công trong một khoảng thời gian ngắn.', effect: 'rage' },
    ],
  },
  {
    name: 'Kiếm', role: 'CÔNG KÍCH · CƠ ĐỘNG', weapon: 'Trường kiếm', accent: '#64d8ff',
    description: 'Di chuyển sắc bén, nối liền các nhát chém và kết thúc mục tiêu trong chớp mắt.',
    skills: [
      { name: 'Phi Thiên Trảm', type: 'Chém lướt', description: 'Lướt qua đội hình địch bằng một đường kiếm nhanh và gọn.', effect: 'dash' },
      { name: 'Kiếm Khí', type: 'Tầm trung', description: 'Phóng một lưỡi kiếm khí xuyên qua khoảng cách trước mặt.', effect: 'slash' },
      { name: 'Liên Hoàn Kiếm', type: 'Đa đòn', description: 'Tạo chuỗi nhát chém liên tiếp, khóa mục tiêu trong vùng kiếm.', effect: 'storm' },
    ],
  },
  {
    name: 'Súng', role: 'TẦM XA · BỘC PHÁ', weapon: 'Súng hỏa mai', accent: '#ffd15a',
    description: 'Giữ khoảng cách an toàn, ngắm đúng thời điểm và tạo sát thương bùng nổ.',
    skills: [
      { name: 'Xuyên Phá Đạn', type: 'Xuyên mục tiêu', description: 'Viên đạn tốc độ cao xuyên thẳng qua hàng phòng thủ phía trước.', effect: 'bullet' },
      { name: 'Liên Thanh', type: 'Đa đòn', description: 'Bắn liên tiếp ba phát, buộc đối thủ không thể đứng yên.', effect: 'burst' },
      { name: 'Hỏa Pháo', type: 'Diện rộng', description: 'Kích nổ một viên đạn lớn, gây chấn động tại điểm va chạm.', effect: 'bomb' },
    ],
  },
  {
    name: 'Cung', role: 'KHỐNG CHẾ · LINH HOẠT', weapon: 'Trường cung', accent: '#7ee08b',
    description: 'Làm chủ khoảng cách bằng những mũi tên chính xác và hiệu ứng khống chế.',
    skills: [
      { name: 'Xuyên Tâm Tiễn', type: 'Chính xác', description: 'Kéo căng dây cung và tung một mũi tên xuyên tâm cực nhanh.', effect: 'arrow' },
      { name: 'Băng Tiễn', type: 'Làm chậm', description: 'Mũi tên lạnh đóng băng vùng va chạm và làm chậm đối thủ.', effect: 'frost' },
      { name: 'Vũ Tiễn', type: 'Diện rộng', description: 'Gọi một trận mưa tên phủ xuống khu vực được chọn.', effect: 'rain' },
    ],
  },
  {
    name: 'Đao', role: 'BỘC PHÁ · DIỆN RỘNG', weapon: 'Đại đao', accent: '#d796ff',
    description: 'Từng nhát đao nặng như sóng lớn, quét sạch kẻ địch trong phạm vi rộng.',
    skills: [
      { name: 'Toàn Phong Trảm', type: 'Quét ngang', description: 'Xoay đại đao thành một vòng chém bao phủ khu vực xung quanh.', effect: 'cleave' },
      { name: 'Liệt Địa Trảm', type: 'Chấn động', description: 'Nện lưỡi đao xuống đất và tạo sóng chấn động chạy về phía trước.', effect: 'quake' },
      { name: 'Bá Vương Đao', type: 'Tuyệt kỹ', description: 'Tích tụ toàn bộ sức mạnh cho một nhát đao kết liễu.', effect: 'finisher' },
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
        <p>Mỗi class có ba kỹ năng tiêu biểu. Chạm vào skill để xem cách đòn đánh vận hành trước khi ra khơi.</p>
      </div>

      <div className="page-width class-lab" style={{ '--class-accent': activeClass.accent } as React.CSSProperties}>
        <div className="class-selector" role="tablist" aria-label="Chọn class nhân vật">
          {CHARACTER_CLASSES.map((item, index) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={activeClassIndex === index}
              aria-controls="class-showcase-panel"
              className={activeClassIndex === index ? 'is-active' : ''}
              onClick={() => selectClass(index)}
            >
              <span>0{index + 1}</span>
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
              <span>MINH HỌA KỸ NĂNG</span>
              <button type="button" onClick={() => setReplayKey((key) => key + 1)}>PHÁT LẠI ↻</button>
            </div>
            <SkillAnimation key={`${activeClassIndex}-${activeSkillIndex}-${replayKey}`} effect={activeSkill.effect} accent={activeClass.accent} name={activeSkill.name} />
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
            <div className="class-dossier__weapon"><span>VŨ KHÍ</span><strong>{activeClass.weapon}</strong></div>

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
                >
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
