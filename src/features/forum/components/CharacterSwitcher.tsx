'use client';

import Image from 'next/image';
import { Plus, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CLASS_PORTRAITS, type ForumCharacter } from '../types/forum.types';

const MAX_CHARACTER_SLOTS = 3;

export function useCharacterSelection(username: string | undefined, characters: ForumCharacter[]) {
  const [selectedName, setSelectedName] = useState<string>('');
  const storageKey = username ? `htth:selected-character:${username}` : '';

  useEffect(() => {
    if (!characters.length) {
      setSelectedName('');
      return;
    }
    const savedName = storageKey ? window.localStorage.getItem(storageKey) : null;
    const nextName = characters.some((character) => character.name === savedName)
      ? savedName!
      : characters[0].name;
    setSelectedName(nextName);
  }, [characters, storageKey]);

  const selectCharacter = useCallback((name: string) => {
    if (!characters.some((character) => character.name === name)) return;
    setSelectedName(name);
    if (storageKey) window.localStorage.setItem(storageKey, name);
  }, [characters, storageKey]);

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.name === selectedName) ?? characters[0] ?? null,
    [characters, selectedName],
  );

  return { selectedCharacter, selectCharacter };
}

interface CharacterSwitcherProps {
  characters: ForumCharacter[];
  selectedName?: string;
  onSelect: (name: string) => void;
  compact?: boolean;
}

export function CharacterSwitcher({ characters, selectedName, onSelect, compact = false }: CharacterSwitcherProps) {
  const slots = Array.from({ length: MAX_CHARACTER_SLOTS }, (_, index) => characters[index] ?? null);

  return <div className={`character-switcher${compact ? ' is-compact' : ''}`} role="tablist" aria-label="Chọn nhân vật đang xem">
    {!compact && <div className="character-switcher__heading"><span>NHÂN VẬT CỦA TÀI KHOẢN</span><b>{characters.length}/{MAX_CHARACTER_SLOTS} vị trí</b></div>}
    <div className="character-switcher__slots">
      {slots.map((character, index) => character ? (
        <button
          aria-selected={character.name === selectedName}
          className={character.name === selectedName ? 'is-selected' : ''}
          key={character.name}
          onClick={() => onSelect(character.name)}
          role="tab"
          type="button"
        >
          <span className={`character-switcher__portrait class-${character.clazz}`}>
            {CLASS_PORTRAITS[character.clazz]
              ? <Image src={CLASS_PORTRAITS[character.clazz]} fill sizes={compact ? '34px' : '46px'} alt="" />
              : <UserRound aria-hidden="true" />}
          </span>
          <span className="character-switcher__copy"><strong>{character.name}</strong><small>{character.className} · Cấp {character.level}</small></span>
          <i aria-hidden="true">0{index + 1}</i>
        </button>
      ) : (
        <button aria-label={`Vị trí nhân vật ${index + 1} đang trống`} className="is-empty" disabled key={`empty-${index}`} role="tab" type="button">
          <span className="character-switcher__portrait"><Plus aria-hidden="true" /></span>
          <span className="character-switcher__copy"><strong>Vị trí trống</strong><small>Tạo trong game</small></span>
          <i aria-hidden="true">0{index + 1}</i>
        </button>
      ))}
    </div>
  </div>;
}
