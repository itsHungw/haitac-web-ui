'use client';

import {
  BookOpenText, Boxes, ChevronRight, CircleHelp, Database, Film, Gem, Map,
  PackageSearch, RotateCcw, Search, Skull, Sparkles, Swords, UserRound,
} from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { DevilFruitIcon } from '@/components/icons/DevilFruitIcon';
import { Parchment } from '@/components/ui/Parchment';

type WikiEntry = { key: string; id: string | number; name: string; source: string; [key: string]: unknown };
type Skill = { id: number; icon?: number; logo?: string; gif?: string | null; name: string; kind: string; damage: number; mana: number; cooldownMs: number; range: number; targets: number; info: string; maxLevel?: number };
type CategoryPayload = { label: string; entries: WikiEntry[] };
type MetaPayload = { counts: Record<string, number>; rawCounts?: Record<string, number>; generatedFrom: string; notes: string[] };

const CATEGORIES = [
  { id: 'npcs', label: 'NPC', icon: UserRound, fallback: 68 },
  { id: 'maps', label: 'Bản đồ', icon: Map, fallback: 152 },
  { id: 'quests', label: 'Nhiệm vụ', icon: BookOpenText, fallback: 158 },
  { id: 'fruits', label: 'Trái ác quỷ', icon: DevilFruitIcon, fallback: 17 },
  { id: 'mobs', label: 'Quái & Boss', icon: Skull, fallback: 172 },
  { id: 'classes', label: 'Class & kỹ năng', icon: Swords, fallback: 5 },
  { id: 'items', label: 'Vật phẩm', icon: PackageSearch, fallback: 1359 },
  { id: 'collections', label: 'Bộ sưu tập', icon: Gem, fallback: 203 },
  { id: 'mechanics', label: 'Cơ chế', icon: Boxes, fallback: 4 },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];
const VISIBLE_LIMIT = 180;
const asArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const asText = (value: unknown, fallback = '—') => value === null || value === undefined || value === '' ? fallback : String(value);
const asNumber = (value: unknown) => typeof value === 'number' ? value : Number(value || 0);
const formatNumber = (value: unknown) => new Intl.NumberFormat('vi-VN').format(asNumber(value));

function categoryFilter(category: CategoryId, entry: WikiEntry) {
  if (category === 'quests') return asText(entry.questType);
  if (category === 'items') return asText(entry.kind);
  if (category === 'collections') return asText(entry.kind);
  if (category === 'npcs') return asText(entry.function).split('\n')[0];
  if (category === 'mobs') return asArray(entry.bossSpawns).length ? 'Boss' : 'Quái thường';
  if (category === 'maps') {
    const level = asNumber(entry.level);
    return level <= 20 ? 'Cấp 1–20' : level <= 50 ? 'Cấp 21–50' : level <= 80 ? 'Cấp 51–80' : 'Cấp 81+';
  }
  return '';
}

function entrySubtitle(category: CategoryId, entry: WikiEntry) {
  if (category === 'npcs') return `${asText(entry.function)} · ${asText(entry.mapName)}${asNumber(entry.occurrenceCount) > 1 ? ` · ${formatNumber(entry.occurrenceCount)} vị trí` : ''}`;
  if (category === 'maps') return `Cấp ${asText(entry.level)} · ${asArray(entry.npcs).length} NPC · ${asArray(entry.mobs).length} vị trí quái`;
  if (category === 'quests') return `${asText(entry.questType)} · ${asText(entry.location, 'Không ghi địa điểm')}`;
  if (category === 'fruits') return `${asArray(entry.skills).length} kỹ năng`;
  if (category === 'mobs') return `Cấp ${asText(entry.level)} · HP ${formatNumber(entry.hp)}`;
  if (category === 'classes') return `${asArray(entry.skills).length} kỹ năng · ${formatNumber(entry.skillRows)} hàng nâng cấp`;
  if (category === 'items') return `${asText(entry.kind)} · ${asText(entry.class, asText(entry.table))}${asNumber(entry.variantCount) > 1 ? ` · ${formatNumber(entry.variantCount)} biến thể` : ''}`;
  if (category === 'collections') return `${asText(entry.kind)} · ID ${asText(entry.id)}${asNumber(entry.variantCount) > 1 ? ` · ${formatNumber(entry.variantCount)} biến thể` : ''}`;
  return asText(entry.summary, 'Cơ chế gameplay');
}

function Stat({ label, value }: { label: string; value: unknown }) {
  return <div className="wiki-stat"><strong>{formatNumber(value)}</strong><span>{label}</span></div>;
}

function Fact({ label, value }: { label: string; value: unknown }) {
  return <div className="wiki-fact"><dt>{label}</dt><dd>{asText(value)}</dd></div>;
}

function SkillCards({ skills }: { skills: Skill[] }) {
  return <div className="wiki-skill-grid">{skills.map((skill) => (
    <section className="wiki-skill" key={`${skill.id}-${skill.name}`}>
      <div><span>{skill.kind}</span><strong>{skill.name}</strong></div>
      <p>{skill.info || 'Không có mô tả trong bảng kỹ năng.'}</p>
      <dl>
        <Fact label="Sát thương" value={skill.damage} /><Fact label="Mana" value={skill.mana} />
        <Fact label="Hồi chiêu" value={`${formatNumber(skill.cooldownMs)} ms`} /><Fact label="Mục tiêu" value={skill.targets} />
        {skill.maxLevel !== undefined && <Fact label="Cấp tối đa" value={skill.maxLevel} />}
      </dl>
    </section>
  ))}</div>;
}

const FRUIT_ACCENTS: Record<number, string> = {
  32: '#ef5b2a', 33: '#8a62cf', 34: '#c48556', 88: '#9caeb7', 90: '#b87842',
  91: '#e08eb8', 92: '#65bde7', 93: '#d9a94d', 160: '#f2d13f', 161: '#e44c2e',
  219: '#d99843', 220: '#a9c7d5', 240: '#9d69db', 316: '#e8dfb6', 317: '#8fa0ae',
  318: '#73a8d8', 427: '#7152a7',
};

function DevilFruitDetail({ entry }: { entry: WikiEntry }) {
  const skills = asArray<Skill>(entry.skills);
  const [activeSkillId, setActiveSkillId] = useState(skills[0]?.id ?? 0);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    setActiveSkillId(skills[0]?.id ?? 0);
    setReplayKey((value) => value + 1);
  }, [entry.key]);

  const activeSkill = skills.find((skill) => skill.id === activeSkillId) ?? skills[0];
  const accent = FRUIT_ACCENTS[asNumber(entry.id)] ?? '#dc6e45';
  const style = { '--fruit-accent': accent } as React.CSSProperties;

  return <div className="devil-dossier" style={style}>
    <header className="devil-hero">
      <div className="devil-hero__specimen" aria-hidden="true">
        <span className="devil-orbit devil-orbit--one" /><span className="devil-orbit devil-orbit--two" />
        <span className="devil-fruit-sprite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asText(entry.image)} alt="" />
        </span>
        <small>ITEM #{asText(entry.id)}</small>
      </div>
      <div className="devil-hero__copy">
        <span><Sparkles size={14} aria-hidden="true" /> HỒ SƠ TRÁI ÁC QUỶ</span>
        <h2>{entry.name}</h2>
        <div><b>{skills.length} kỹ năng</b><b>Hành động: {asText(entry.useAction)}</b></div>
      </div>
    </header>

    <div className="devil-skill-tabs" role="tablist" aria-label={`Kỹ năng ${entry.name}`}>
      {skills.map((skill, index) => <button type="button" role="tab" aria-selected={skill.id === activeSkill?.id} className={skill.id === activeSkill?.id ? 'is-active' : ''} key={skill.id} onClick={() => { setActiveSkillId(skill.id); setReplayKey((value) => value + 1); }}>
        <span className="devil-skill-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {skill.logo && <img src={skill.logo} alt="" />}
        </span>
        <span><small>SKILL {String(index + 1).padStart(2, '0')} · {skill.kind}</small><strong>{skill.name}</strong></span>
      </button>)}
    </div>

    {activeSkill && <section className="devil-stage" role="tabpanel">
      <div className={`devil-stage__media ${activeSkill.gif ? 'has-gif' : 'is-poster'}`}>
        <div className="devil-stage__topline"><span><Film size={14} aria-hidden="true" /> MINH HỌA CHIÊU THỨC</span>{activeSkill.gif && <button type="button" onClick={() => setReplayKey((value) => value + 1)}><RotateCcw size={14} aria-hidden="true" /> Phát lại</button>}</div>
        {activeSkill.gif ? <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={`${activeSkill.id}-${replayKey}`} className="devil-stage__gif" src={`${activeSkill.gif}?v=${replayKey}`} alt={`GIF kỹ năng ${activeSkill.name}`} />
        </> : <div className="devil-motion-poster">
          <span className="devil-motion-poster__ring" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {activeSkill.logo && <img src={activeSkill.logo} alt={`Logo ${activeSkill.name}`} />}
          <div><b>GIF GAMEPLAY</b><small>Đang chờ file {activeSkill.id}.gif trong kho media</small></div>
        </div>}
      </div>
      <div className="devil-stage__intel">
        <span>{activeSkill.kind} · SKILL #{activeSkill.id}</span>
        <h3>{activeSkill.name}</h3>
        <p>{activeSkill.info || 'Không có mô tả trong bảng kỹ năng.'}</p>
        <dl>
          <Fact label="Sát thương" value={activeSkill.damage} /><Fact label="Mana" value={activeSkill.mana} />
          <Fact label="Hồi chiêu" value={`${formatNumber(activeSkill.cooldownMs)} ms`} /><Fact label="Tầm đánh" value={activeSkill.range} />
          <Fact label="Mục tiêu" value={activeSkill.targets} /><Fact label="Icon gốc" value={activeSkill.icon} />
        </dl>
      </div>
    </section>}

    <footer className="wiki-provenance"><Database size={15} aria-hidden="true" /><span>Nguồn dữ liệu: {entry.source}</span></footer>
  </div>;
}

function Detail({ category, entry }: { category: CategoryId; entry: WikiEntry }) {
  const source = <footer className="wiki-provenance"><Database size={15} aria-hidden="true" /><span>Nguồn dữ liệu: {entry.source}</span></footer>;

  if (category === 'npcs') {
    const locations = asArray<{ id: number; mapId: number; mapName: string; x: number; y: number }>(entry.locations);
    const visibleLocations = locations.slice(0, entry.utility ? 24 : 80);
    return <>
    <header className="wiki-detail__header"><span>{entry.utility ? `NPC TIỆN ÍCH · ${asArray(entry.ids).length} ID` : `NPC #${asText(entry.id)}`}</span><h2>{entry.name}</h2><p>{asText(entry.function)} tại {asText(entry.mapName)}</p></header>
    <dl className="wiki-facts"><Fact label="Phạm vi" value={asText(entry.mapName)} /><Fact label="Số vị trí" value={entry.occurrenceCount} /><Fact label="Chức năng" value={entry.function} /><Fact label="Mã icon" value={entry.typeIcon} /></dl>
    <section className="wiki-copy"><h3>Địa điểm xuất hiện</h3><div className="wiki-data-list">{visibleLocations.map((location, index) => <div key={`${location.mapId}-${index}`}><strong>{location.mapName}</strong><span>map #{location.mapId} · NPC #{location.id} · x {location.x} · y {location.y}</span></div>)}</div>{locations.length > visibleLocations.length && <p>Còn {formatNumber(locations.length - visibleLocations.length)} vị trí khác đã được gộp trong cùng hồ sơ này.</p>}</section>
    {asText(entry.chat, '') && <section className="wiki-copy"><h3>Lời thoại mặc định</h3><blockquote>{asText(entry.chat)}</blockquote></section>}{source}
  </>;
  }

  if (category === 'maps') {
    const npcs = asArray<{ id: number; name: string; function: string }>(entry.npcs);
    const mobs = asArray<{ id: number; name: string }>(entry.mobs);
    const destinations = asArray<{ id: number; name: string }>(entry.destinations);
    return <>
      <header className="wiki-detail__header"><span>BẢN ĐỒ #{asText(entry.id)}</span><h2>{entry.name}</h2><p>Khu vực cấp {asText(entry.level)} trong dữ liệu map đang hoạt động.</p></header>
      <div className="wiki-stat-row"><Stat label="Khu" value={entry.maxZones} /><Stat label="Người / khu" value={entry.maxPlayersPerZone} /><Stat label="NPC" value={npcs.length} /><Stat label="Vị trí quái" value={mobs.length} /></div>
      <section className="wiki-copy"><h3>Lối kết nối</h3><div className="wiki-tags">{destinations.length ? destinations.map((item) => <span key={`${item.id}-${item.name}`}>{item.name} <small>#{item.id}</small></span>) : <p>Không có cổng nối trong hàng dữ liệu này.</p>}</div></section>
      <section className="wiki-copy"><h3>NPC trong map</h3><div className="wiki-data-list">{npcs.length ? npcs.map((item, index) => <div key={`${item.id}-${index}`}><strong>{item.name}</strong><span>{item.function || 'Không ghi chức năng'}</span></div>) : <p>Không có NPC.</p>}</div></section>
      <section className="wiki-copy"><h3>Quái được bố trí</h3><div className="wiki-tags">{mobs.length ? Array.from(new globalThis.Map(mobs.map((item) => [item.id, item])).values()).map((item) => <span key={item.id}>{item.name} <small>#{item.id}</small></span>) : <p>Không có vị trí quái.</p>}</div></section>{source}
    </>;
  }

  if (category === 'quests') {
    const objectives = asArray<{ kind: string; target: string; required: number }>(entry.objectives);
    const rewards = asArray<{ name: string; amount: number; icon: number; color: number | null }>(entry.rewards);
    return <>
      <header className="wiki-detail__header"><span>{asText(entry.questType)} · CHUỖI #{asText(entry.id)}</span><h2>{entry.name}</h2><p>{asText(entry.location, 'Dữ liệu không ghi địa điểm nhận nhiệm vụ.')}</p></header>
      <dl className="wiki-facts"><Fact label="Cấp yêu cầu" value={asNumber(entry.requiredLevel) < 0 ? 'Không yêu cầu' : entry.requiredLevel} /><Fact label="NPC nhận" value={`#${asText(entry.npcId)}`} /><Fact label="Map mục tiêu" value={entry.targetMapName ? `${asText(entry.targetMapName)} (#${asText(entry.targetMapId)})` : asText(entry.targetMapId)} /><Fact label="Trạng thái có trong DB" value={asArray(entry.statesPresent).join(' → ')} /></dl>
      <section className="wiki-copy"><h3>Mục tiêu</h3><div className="wiki-objectives">{objectives.length ? objectives.map((item, index) => <div key={`${item.target}-${index}`}><span>{item.kind}</span><strong>{item.target}</strong><b>× {formatNumber(item.required)}</b></div>) : <p>Chuỗi này không có mục tiêu đếm trong `data_quest`.</p>}</div></section>
      <section className="wiki-copy"><h3>Phần thưởng hoàn thành</h3><div className="wiki-data-list">{rewards.length ? rewards.map((item, index) => <div key={`${item.name}-${index}`}><strong>{item.name}</strong><span>{formatNumber(item.amount)} · icon {item.icon} · màu {asText(item.color)}</span></div>) : <p>Không có quà trong hàng trạng thái hoàn thành.</p>}</div></section>
      {(asText(entry.objectiveDialog, '') || asText(entry.reminder, '')) && <section className="wiki-copy"><h3>Chỉ dẫn trong game</h3>{asText(entry.objectiveDialog, '') && <p>{asText(entry.objectiveDialog)}</p>}{asText(entry.reminder, '') && <blockquote>{asText(entry.reminder)}</blockquote>}</section>}{source}
    </>;
  }

  if (category === 'fruits') return <DevilFruitDetail entry={entry} />;

  if (category === 'classes') {
    const skills = asArray<Skill>(entry.skills);
    return <>
      <header className="wiki-detail__header"><span>CLASS #{asText(entry.id)}</span><h2>{entry.name}</h2><p>{skills.length} kỹ năng riêng, tổng {formatNumber(entry.skillRows)} hàng cấp trong bảng skill.</p></header>
      <SkillCards skills={skills} />{source}
    </>;
  }

  if (category === 'mobs') {
    const maps = asArray<{ id: number; name: string; count: number }>(entry.maps);
    const bosses = asArray<{ mapId: number; mapName: string; hp: number; level: number }>(entry.bossSpawns);
    return <>
      <header className="wiki-detail__header"><span>{bosses.length ? 'BOSS' : 'QUÁI'} #{asText(entry.id)}</span><h2>{entry.name}</h2><p>{bosses.length ? 'Mẫu quái này có cấu hình xuất hiện trong bảng boss.' : 'Mẫu quái từ bảng mobs của server.'}</p></header>
      <div className="wiki-stat-row"><Stat label="Cấp" value={entry.level} /><Stat label="HP mẫu" value={entry.hp} /><Stat label="Sát thương" value={entry.damage} /><Stat label="Số map" value={maps.length} /></div>
      {bosses.length > 0 && <section className="wiki-copy"><h3>Điểm xuất hiện Boss</h3><div className="wiki-data-list">{bosses.map((boss, index) => <div key={`${boss.mapId}-${index}`}><strong>{boss.mapName || `Map #${boss.mapId}`}</strong><span>Cấp {boss.level} · HP {formatNumber(boss.hp)}</span></div>)}</div></section>}
      <section className="wiki-copy"><h3>Phân bố trên bản đồ</h3><div className="wiki-data-list">{maps.length ? maps.map((map) => <div key={map.id}><strong>{map.name}</strong><span>{map.count} vị trí · map #{map.id}</span></div>) : <p>Không có vị trí thường trong các map đang hoạt động.</p>}</div></section>{source}
    </>;
  }

  if (category === 'items') {
    const options = asArray<{ id: number; name: string; value: number }>(entry.options);
    const variants = asArray<Record<string, unknown>>(entry.variants);
    return <>
      <header className="wiki-detail__header"><span>{asText(entry.kind).toLocaleUpperCase('vi')} · {asText(entry.table)}</span><h2>{entry.name}</h2><p>ID {asText(entry.id)} · icon {asText(entry.icon)}</p></header>
      <dl className="wiki-facts"><Fact label="Class" value={entry.class} /><Fact label="Khoảng cấp" value={entry.levelMin !== undefined && entry.levelMin !== entry.levelMax ? `${asText(entry.levelMin)}–${asText(entry.levelMax)}` : entry.level} /><Fact label="Giá beri" value={entry.beri === null ? '—' : formatNumber(entry.beri)} /><Fact label="Giá ruby" value={entry.ruby === null ? '—' : formatNumber(entry.ruby)} /><Fact label="Hành động" value={entry.useAction} /><Fact label="Thời gian chờ" value={entry.cooldownMs === undefined ? '—' : `${formatNumber(entry.cooldownMs)} ms`} /></dl>
      {asText(entry.info, '') && <section className="wiki-copy"><h3>Mô tả trong game</h3><p>{asText(entry.info)}</p></section>}
      {options.length > 0 && <section className="wiki-copy"><h3>Tùy chọn gốc</h3><div className="wiki-tags">{options.map((option) => <span key={`${option.id}-${option.value}`}>{option.name}: {formatNumber(option.value)}</span>)}</div></section>}
      {variants.length > 0 && <section className="wiki-copy"><h3>Biến thể trong dữ liệu ({formatNumber(variants.length)})</h3><div className="wiki-data-list">{variants.slice(0, 180).map((variant, index) => <div key={`${asText(variant.table)}-${asText(variant.id)}-${index}`}><strong>ID {asText(variant.id)} · {asText(variant.class, asText(variant.table))}</strong><span>Cấp {asText(variant.level)} · icon {asText(variant.icon)} · màu {asText(variant.color)}</span></div>)}</div></section>}
      {source}
    </>;
  }

  if (category === 'collections') {
    const options = asArray<{ id: number; name: string; value: number }>(entry.options);
    const sites = asArray<{ mapId: number; mapName: string; x: number; y: number }>(entry.sites);
    const variants = asArray<Record<string, unknown>>(entry.variants);
    return <>
      <header className="wiki-detail__header"><span>{asText(entry.kind).toLocaleUpperCase('vi')} · #{asText(entry.id)}</span><h2>{entry.name}</h2><p>{asText(entry.info, `Mục ${asText(entry.kind).toLocaleLowerCase('vi')} được server nạp từ bảng dữ liệu tương ứng.`)}</p></header>
      <dl className="wiki-facts"><Fact label="Icon" value={entry.icon} /><Fact label="Frame" value={entry.frame ?? entry.frames} /><Fact label="Beri" value={entry.beri === undefined ? '—' : formatNumber(entry.beri)} /><Fact label="Ruby" value={entry.ruby === undefined ? '—' : formatNumber(entry.ruby)} /><Fact label="Cấp" value={entry.level} /><Fact label="HP" value={entry.hp === undefined ? '—' : formatNumber(entry.hp)} /></dl>
      {options.length > 0 && <section className="wiki-copy"><h3>Chỉ số</h3><div className="wiki-data-list">{options.map((option) => <div key={`${option.id}-${option.value}`}><strong>{option.name}</strong><span>{formatNumber(option.value)} · mã #{option.id}</span></div>)}</div></section>}
      {sites.length > 0 && <section className="wiki-copy"><h3>Điểm xuất hiện ({formatNumber(sites.length)})</h3><div className="wiki-data-list">{sites.slice(0, 160).map((site, index) => <div key={`${site.mapId}-${index}`}><strong>{site.mapName || `Map #${site.mapId}`}</strong><span>x {site.x} · y {site.y}</span></div>)}</div></section>}
      {variants.length > 0 && <section className="wiki-copy"><h3>Biến thể ({formatNumber(variants.length)})</h3><div className="wiki-data-list">{variants.map((variant, index) => <div key={`${asText(variant.id)}-${index}`}><strong>ID {asText(variant.id)}</strong><span>icon {asText(variant.icon)} · frame {asText(variant.frame, asText(variant.frames))}</span></div>)}</div></section>}
      {source}
    </>;
  }

  const haki = asArray<{ name: string; levels: Skill[] }>(entry.haki);
  const skills = asArray<Skill>(entry.skills);
  return <>
    <header className="wiki-detail__header"><span>CƠ CHẾ SERVER</span><h2>{entry.name}</h2><p>{asText(entry.summary)}</p></header>
    {haki.map((branch) => <section className="wiki-copy" key={branch.name}><h3>{branch.name}</h3><SkillCards skills={branch.levels} /></section>)}
    {skills.length > 0 && <SkillCards skills={skills} />}
    {entry.values !== undefined && <section className="wiki-copy"><h3>Mốc dữ liệu</h3><pre>{JSON.stringify(entry.values, null, 2)}</pre></section>}{source}
  </>;
}

export function WikiGuide() {
  const cache = useRef<Partial<Record<CategoryId, CategoryPayload>>>({});
  const [category, setCategory] = useState<CategoryId>('quests');
  const [payload, setPayload] = useState<CategoryPayload | null>(null);
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState('Tất cả');
  const [activeKey, setActiveKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('muc') as CategoryId | null;
    if (requested && CATEGORIES.some((item) => item.id === requested)) setCategory(requested);
    setActiveKey(params.get('id') || '');
    fetch('/data/wiki/meta.json').then((response) => response.json()).then(setMeta).catch(() => undefined);
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true); setError(''); setFilter('Tất cả');
    const cached = cache.current[category];
    const request = cached ? Promise.resolve(cached) : fetch(`/data/wiki/${category}.json`).then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json() as Promise<CategoryPayload>;
    });
    request.then((nextPayload) => {
      if (!live) return;
      cache.current[category] = nextPayload; setPayload(nextPayload); setLoading(false);
    }).catch(() => {
      if (!live) return;
      setError('Không thể tải dữ liệu Wiki. Hãy thử làm mới trang.'); setLoading(false);
    });
    return () => { live = false; };
  }, [category]);

  const entries = payload?.entries ?? [];
  const filters = useMemo(() => ['Tất cả', ...Array.from(new Set(entries.map((entry) => categoryFilter(category, entry)).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))], [category, entries]);
  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLocaleLowerCase('vi');
    return entries.filter((entry) => {
      if (filter !== 'Tất cả' && categoryFilter(category, entry) !== filter) return false;
      return !normalized || `${entry.name} ${entry.id} ${entrySubtitle(category, entry)} ${JSON.stringify(entry)}`.toLocaleLowerCase('vi').includes(normalized);
    });
  }, [category, deferredQuery, entries, filter]);
  const activeEntry = filtered.find((entry) => entry.key === activeKey) ?? filtered[0];

  useEffect(() => { if (activeEntry && activeEntry.key !== activeKey) setActiveKey(activeEntry.key); }, [activeEntry, activeKey]);
  useEffect(() => {
    if (!activeKey) return;
    const url = new URL(window.location.href);
    url.searchParams.set('muc', category); url.searchParams.set('id', activeKey);
    window.history.replaceState(null, '', `${url.pathname}${url.search}`);
  }, [activeKey, category]);

  const categoryConfig = CATEGORIES.find((item) => item.id === category) ?? CATEGORIES[0];
  const totalCount = meta?.counts[category] ?? categoryConfig.fallback;

  return <section className="wiki-section" aria-labelledby="wiki-explorer-title">
    <div className="page-width wiki-overview">
      <div><span className="wiki-kicker"><Database size={14} aria-hidden="true" /> DỮ LIỆU ĐỐI CHIẾU TỪ SOURCE GAME</span><h2 id="wiki-explorer-title">Hải đồ tri thức</h2><p>Tra cứu NPC, đường đi, chuỗi nhiệm vụ, trái ác quỷ, quái, class và toàn bộ vật phẩm đang có trong dữ liệu server.</p></div>
      <div className="wiki-overview__stats" aria-label="Thống kê Wiki"><Stat label="Bản đồ" value={meta?.counts.maps ?? 152} /><Stat label="Chuỗi nhiệm vụ" value={meta?.counts.quests ?? 158} /><Stat label="Mục vật phẩm" value={meta?.counts.items ?? 1359} /></div>
    </div>

    <Parchment className="page-width wiki-scroll-shell">
    <div className="wiki-category-dock" role="tablist" aria-label="Chuyên mục Wiki">{CATEGORIES.map((item) => {
      const Icon = item.icon; const selected = category === item.id;
      return <button type="button" role="tab" aria-selected={selected} className={selected ? 'is-active' : ''} key={item.id} onClick={() => { setCategory(item.id); setActiveKey(''); setQuery(''); }}><Icon size={18} strokeWidth={2.2} aria-hidden="true" /><span>{item.label}</span><b>{formatNumber(meta?.counts[item.id] ?? item.fallback)}</b></button>;
    })}</div>

    <div className="wiki-toolbar"><label htmlFor="wiki-search"><Search size={18} aria-hidden="true" /><span>Tìm trong {categoryConfig.label}</span></label><input id="wiki-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Nhập tên hoặc ID ${categoryConfig.label.toLocaleLowerCase('vi')}...`} /><span aria-live="polite">{formatNumber(filtered.length)} / {formatNumber(totalCount)} mục</span></div>
    {filters.length > 1 && <div className="wiki-filters" aria-label="Bộ lọc">{filters.map((item) => <button type="button" className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>}

    <div className="wiki-layout">
      <aside className="wiki-results" aria-label={`Danh sách ${categoryConfig.label}`}><header><span>{categoryConfig.label}</span><b>{formatNumber(filtered.length)}</b></header><div className="wiki-result-list">
        {loading && Array.from({ length: 8 }, (_, index) => <div className="wiki-skeleton" key={index} />)}
        {!loading && error && <div className="wiki-state"><CircleHelp size={24} /><p>{error}</p></div>}
        {!loading && !error && filtered.slice(0, VISIBLE_LIMIT).map((entry, index) => <button type="button" className={activeEntry?.key === entry.key ? 'is-active' : ''} aria-current={activeEntry?.key === entry.key ? 'true' : undefined} key={entry.key} onClick={() => setActiveKey(entry.key)}><span>{String(index + 1).padStart(3, '0')}</span><div><strong>{entry.name}</strong><small>{entrySubtitle(category, entry)}</small></div><ChevronRight size={16} aria-hidden="true" /></button>)}
        {!loading && !error && filtered.length === 0 && <div className="wiki-state"><Search size={24} /><p>Không tìm thấy mục phù hợp. Thử tên khác hoặc bỏ bộ lọc.</p></div>}
      </div>{filtered.length > VISIBLE_LIMIT && <p className="wiki-result-note">Đang hiện {VISIBLE_LIMIT} mục đầu. Nhập thêm từ khóa để thu hẹp {formatNumber(filtered.length)} kết quả.</p>}</aside>
      <article className="wiki-detail" id="wiki-detail" aria-live="polite">{loading && <div className="wiki-detail-loading"><div className="wiki-skeleton" /><div className="wiki-skeleton" /><div className="wiki-skeleton" /></div>}{!loading && activeEntry && <Detail category={category} entry={activeEntry} />}{!loading && !activeEntry && <div className="wiki-state"><CircleHelp size={30} /><h2>Chưa có dữ liệu để hiển thị</h2><p>Hãy đổi bộ lọc hoặc từ khóa tìm kiếm.</p></div>}</article>
    </div>
    <p className="wiki-disclaimer"><Database size={14} aria-hidden="true" /> Snapshot được sinh từ `deploy.sql`, Java server và Unity client. Tên cũ trong dữ liệu được giữ nguyên để khớp với game.</p>
    </Parchment>
  </section>;
}
