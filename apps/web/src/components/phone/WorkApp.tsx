import { useEffect, useState } from 'react';
import type { ActivityDef, Character } from '@dsim/shared';
import { RELATIONSHIP_STAT_LABELS, type RelationshipStatKey } from '@dsim/shared';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/hooks';
import { useAppData } from '../../state/app-context';
import { useT, type TFunc } from '../../i18n';
import { Icon } from '../Icon';
import { PhoneAppBar } from './PhoneAppBar';
import { PortraitPicker } from '../PortraitPicker';
import { Banner } from '../ui';
import './phone-life.css';

/** Translate a stat key + numeric value into a warm, feeling-first phrase. */
function trainingNote(stat: RelationshipStatKey | undefined, value: number | undefined, t: TFunc): string {
  if (!stat) return t('work.note.default');
  const label = RELATIONSHIP_STAT_LABELS[stat] ?? stat;
  if (stat === 'tension') {
    // Tension rising is usually a negative signal.
    return value != null && value > 50 ? t('work.note.tensionHigh', { label }) : t('work.note.tensionLow');
  }
  if (value == null) return t('work.note.warmedNoVal', { label });
  if (value >= 80) return t('work.note.flourishing', { label });
  if (value >= 60) return t('work.note.closer', { label });
  if (value >= 40) return t('work.note.goodHour', { label });
  return t('work.note.slow', { label });
}

export function WorkApp() {
  const t = useT();
  const { activeWorldId, reloadPlayer, refreshWorldState, worldState, dayTick, activeDate } = useAppData();
  const [activities, setActivities] = useState<ActivityDef[]>([]);
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();
  const [error, setError] = useState<string>();
  // No actions left today — gate the tiles up front instead of letting the POST 400.
  const noEnergy = (worldState?.stamina ?? 0) <= 0;
  // You can't clock in or train while you're out on a date — finish it first.
  const onDate = !!activeDate;

  useEffect(() => {
    api.listActivities().then(setActivities).catch(() => undefined);
    api.listCharacters().then(setAllCharacters).catch(() => undefined);
  }, [dayTick]);

  // Training happens in the active world, so only offer its characters.
  const characters = allCharacters.filter((c) => c.worldId === activeWorldId);
  useEffect(() => {
    if (characters.length && (target === null || !characters.some((c) => c.id === target))) {
      setTarget(characters[0]!.id);
    }
  }, [characters, target]);

  const perform = async (a: ActivityDef) => {
    if (!activeWorldId) {
      setError(t('work.err.pickWorld'));
      return;
    }
    if (onDate) {
      setError(t('work.err.onDate', { name: activeDate!.characterName }));
      return;
    }
    if (a.kind === 'training' && !target) {
      setError(t('work.err.chooseSomeone'));
      return;
    }
    setBusy(true);
    setNote(undefined);
    setError(undefined);
    try {
      const res = await api.performActivity({
        activityId: a.id,
        worldId: activeWorldId,
        characterId: a.kind === 'training' ? target : null,
      });
      await Promise.all([reloadPlayer(), refreshWorldState()]);
      if (a.kind === 'work') {
        setNote(t('work.earned', { money: res.money, day: res.state.day, phase: res.state.phase }));
      } else {
        const stat = a.relationshipStat;
        const now = stat && res.relationship ? res.relationship[stat] : undefined;
        setNote(trainingNote(stat, now, t));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const work = activities.filter((a) => a.kind === 'work');
  const training = activities.filter((a) => a.kind === 'training');

  const partnerOptions = characters.map((c) => ({
    id: c.id,
    character: c,
  }));

  return (
    <div className="phone-app">
      <PhoneAppBar title={t('work.title')} kicker={t('work.kicker')} icon="work" />
      <div className="phone-embed pl-work-embed">
        {(note || error) && (
          <div className="pl-work-banner">
            {note && <Banner kind="ok">{note}</Banner>}
            {error && <Banner kind="error">{error}</Banner>}
          </div>
        )}

        <div className="pl-board">
          <p className="pl-board-note">{t('work.boardNote')}</p>
          {noEnergy && <p className="pl-board-note">{t('work.noEnergy')}</p>}
          {onDate && (
            <p className="pl-board-note">{t('work.onDateNote', { name: activeDate!.characterName })}</p>
          )}
        </div>

        <div className="pl-eyebrow">{t('work.shiftsHead')}</div>
        {work.map((a) => (
          <div className="pl-tile pl-work" key={a.id}>
            <div className="pl-tile-icon"><Icon name="work" size={18} /></div>
            <div className="pl-tile-body">
              <div className="pl-tile-label">{a.label}</div>
              <div className="pl-tile-desc">{a.description}</div>
            </div>
            <div className="pl-tile-action">
              <button className="btn sm primary" onClick={() => perform(a)} disabled={busy || noEnergy || onDate}>
                <span className="pl-coin">◈ {a.money}</span>
              </button>
            </div>
          </div>
        ))}

        <div className="pl-eyebrow">{t('work.trainingHead')}</div>
        {partnerOptions.length > 0 && (
          <div className="pl-partner-pick">
            <div className="pl-partner-label">{t('work.with')}</div>
            <PortraitPicker
              options={partnerOptions}
              value={target}
              onChange={(id) => setTarget(id)}
              compact
            />
          </div>
        )}
        {training.map((a) => (
          <div className="pl-tile pl-train" key={a.id}>
            <div className="pl-tile-icon"><Icon name="sparkle" size={18} /></div>
            <div className="pl-tile-body">
              <div className="pl-tile-label">{a.label}</div>
              <div className="pl-tile-desc">{a.description}</div>
            </div>
            <div className="pl-tile-action">
              <button className="btn sm" onClick={() => perform(a)} disabled={busy || !target || noEnergy || onDate}>
                <span className="pl-coin">+{a.amount}</span>
                {a.relationshipStat ? ` ${RELATIONSHIP_STAT_LABELS[a.relationshipStat]}` : ''}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
