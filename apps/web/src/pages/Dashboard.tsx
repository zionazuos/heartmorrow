import './dashboard.page.css';
import { Link } from 'react-router-dom';
import { PHASE_ICONS, SEASON_ICONS, deriveCalendar, type Phase } from '@dsim/shared';
import { phaseLabel, seasonLabel, dayLabel } from '../i18n/sharedLabels';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { Portrait } from '../components/Portrait';
import { Empty } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';
import { EnergyPips } from '../components/EnergyPips';
import { useAppData } from '../state/app-context';
import { useT } from '../i18n';
import type { MessageKey } from '../i18n/locales/en';

const GREETING_KEY: Record<Phase, MessageKey> = {
  morning: 'dash.greeting.morning',
  afternoon: 'dash.greeting.afternoon',
  evening: 'dash.greeting.evening',
  night: 'dash.greeting.night',
};

const PHASE_LINE_KEY: Record<Phase, MessageKey> = {
  morning: 'dash.line.morning',
  afternoon: 'dash.line.afternoon',
  evening: 'dash.line.evening',
  night: 'dash.line.night',
};

// How many faces the homepage "People in your life" strip previews before pointing
// the player to the full roster. Newest-first, so a just-added person is always shown.
const PEOPLE_PREVIEW_CAP = 15;

const TILES: { to: string; icon: IconName; titleKey: MessageKey; descKey: MessageKey }[] = [
  { to: '/chat', icon: 'date', titleKey: 'dash.tile.date.title', descKey: 'dash.tile.date.desc' },
  { to: '/phone', icon: 'phone', titleKey: 'dash.tile.phone.title', descKey: 'dash.tile.phone.desc' },
  { to: '/characters', icon: 'people', titleKey: 'dash.tile.people.title', descKey: 'dash.tile.people.desc' },
  { to: '/settings', icon: 'settings', titleKey: 'dash.tile.settings.title', descKey: 'dash.tile.settings.desc' },
];

export function Dashboard() {
  const { creatorMode, player, worldState, activeWorld, activeWorldId, dayTick } = useAppData();
  const characters = useAsync(() => api.listCharacters(), [activeWorldId, dayTick]);
  const t = useT();

  const phase = worldState?.phase ?? null;
  const cal = worldState ? deriveCalendar(worldState.day) : null;
  const name = player?.name?.trim();
  const greeting = phase ? t(GREETING_KEY[phase]) : t('dash.greeting.fallback');
  const line = phase ? t(PHASE_LINE_KEY[phase]) : t('dash.line.fallback');
  // Only the active world's cast appears in this world. The strip below is a capped
  // preview (newest first, then `.slice(0, PEOPLE_PREVIEW_CAP)`) — the server returns
  // characters oldest-first, so reversing here keeps a just-added person visible
  // instead of letting them fall past the oldest faces.
  const people = (characters.data ?? [])
    .filter((c) => !activeWorldId || c.worldId === activeWorldId)
    .reverse();
  const hiddenCount = Math.max(0, people.length - PEOPLE_PREVIEW_CAP);

  return (
    <div className="stack">
      {/* Signature element: the framed hero centerpiece. */}
      <section className="framed dash-hero bracketed">
        <div className="dash-hero-grain" />
        <div className="dash-hero-inner">
          <div className="dash-hero-eyebrow">{t('dash.hero.eyebrow')}</div>
          <h1 className="dash-hero-title">
            {greeting}
            {name ? (
              <>
                , <span className="dash-hero-name">{name}</span>
              </>
            ) : (
              ''
            )}
            .
          </h1>
          <p className="dash-hero-line">{line}</p>
        </div>
      </section>

      {/* Game HUD: the world clock as a status console. */}
      {worldState && cal && (
        <div className="dash-hud">
          <div className="dash-hud-strip">
            <span className="dash-hud-label">{t('dash.hud.status')}</span>
            <span className="dash-hud-rule" />
          </div>
          <div className="dash-hud-cells">
            {activeWorld && (
              <div className="dash-cell world">
                <span className="dash-cell-k">{t('dash.hud.world')}</span>
                <span className="dash-cell-v">{activeWorld.name}</span>
              </div>
            )}
            <div className="dash-cell" title={phaseLabel(t, worldState.phase)}>
              <span className="dash-cell-k">{t('dash.hud.dayHour')}</span>
              <span className="dash-cell-v">
                <span className="dash-icon">{PHASE_ICONS[worldState.phase]}</span>
                <span className="dash-num">{t('dash.hud.day', { day: worldState.day })}</span>
              </span>
              <span className="dash-cell-sub">{phaseLabel(t, worldState.phase)}</span>
            </div>
            <div className="dash-cell" title={`${dayLabel(t, cal.dayOfWeek)} · ${seasonLabel(t, cal.season)}`}>
              <span className="dash-cell-k">{t('dash.hud.calendar')}</span>
              <span className="dash-cell-v">
                <span className="dash-icon">{SEASON_ICONS[cal.season]}</span>
                {dayLabel(t, cal.dayOfWeek)}
              </span>
              <span className="dash-cell-sub">
                {seasonLabel(t, cal.season)}
                {cal.isWeekend ? ` · ${t('dash.hud.weekend')}` : ''}
              </span>
            </div>
            <div
              className="dash-cell dash-energy"
              title={t('dash.hud.energyTitle', { value: worldState.stamina, max: worldState.staminaMax })}
            >
              <span className="dash-cell-k">{t('dash.hud.energy')}</span>
              <span className="dash-cell-v">
                <EnergyPips value={worldState.stamina} max={worldState.staminaMax} />
                <span className="dash-energy-count">
                  {worldState.stamina}/{worldState.staminaMax}
                </span>
              </span>
            </div>
            <span className="money-pill dash-hud-money">
              <Icon name="coin" size={15} /> {player?.money ?? 0}
            </span>
          </div>
        </div>
      )}

      <section className="dash-people">
        <div className="section-head">
          <div className="titles">
            <span className="kicker">{t('dash.circle.kicker')}</span>
            <h2>{t('dash.circle.title')}</h2>
          </div>
          <span className="trail" />
          <Link className="btn sm ghost" to="/characters">
            {t('dash.circle.seeEveryone')}
          </Link>
        </div>
        {people.length === 0 ? (
          <Empty icon="✦" title={t('dash.empty.title')}>
            {creatorMode ? (
              <>
                <p className="muted">{t('dash.empty.createLede')}</p>
                <Link className="btn primary" to="/characters/new">
                  {t('dash.empty.createBtn')}
                </Link>
              </>
            ) : (
              <p className="muted">{t('dash.empty.playLede')}</p>
            )}
          </Empty>
        ) : (
          <>
            <div className="dash-people-row">
              {people.slice(0, PEOPLE_PREVIEW_CAP).map((c) => (
                <Link key={c.id} className="dash-plate" to={`/characters/${c.id}`} title={c.name}>
                  <Portrait character={c} />
                  <span className="dash-plate-foot">
                    <span className="dash-plate-tick" />
                    <span className="dash-plate-name truncate">{c.name}</span>
                  </span>
                </Link>
              ))}
              {creatorMode && (
                <Link className="dash-plate-add" to="/characters/new" title={t('dash.people.newCharacter')}>
                  <span className="dash-plate-add-mark"><Icon name="plus" size={26} /></span>
                  <span>{t('dash.people.new')}</span>
                </Link>
              )}
            </div>
            {hiddenCount > 0 && (
              <p className="dash-people-more muted">
                {t(hiddenCount === 1 ? 'dash.people.morePrefixOne' : 'dash.people.morePrefixMany', {
                  count: hiddenCount,
                })}
                <Link to="/chat">{t('dash.people.dateTabLink')}</Link>
                {t('dash.people.moreSuffix')}
              </p>
            )}
          </>
        )}
      </section>

      <section className="dash-people">
        <div className="section-head">
          <div className="titles">
            <span className="kicker">{t('dash.quick.kicker')}</span>
            <h2>{t('dash.quick.title')}</h2>
          </div>
          <span className="trail" />
        </div>
        <div className="dash-menu">
          {TILES.map((x) => (
            <Link key={x.to} to={x.to} className="dash-tile">
              <span className="dash-tile-glyph"><Icon name={x.icon} size={24} /></span>
              <span className="dash-tile-text">
                <span className="dash-tile-title">{t(x.titleKey)}</span>
                <span className="dash-tile-desc">{t(x.descKey)}</span>
              </span>
              <span className="dash-tile-go"><Icon name="chevronRight" size={18} /></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
