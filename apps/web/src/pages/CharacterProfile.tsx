import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  effectiveDatingStats,
  isInternalFlagKey,
  humanizeStoryFlag,
  relationshipStage,
  currentStatus,
  isBrokenUp,
  isMemorialized,
  isOnTheRocks,
  RECONCILE_COOLDOWN_DAYS,
  DAYS_OF_WEEK,
  WEATHER_ICONS,
  listActiveBuffs,
  type CharacterMemory,
  type ConversationSession,
  type Relationship,
} from '@dsim/shared';
import { api } from '../lib/api';
import { useAsync, errorMessage } from '../lib/hooks';
import { useAppData } from '../state/app-context';
import { useT, type TFunc } from '../i18n';
import type { MessageKey } from '../i18n/locales/en';
import {
  statusLabel,
  relStyleLabel,
  linkLabel,
  genderLabel,
  sexualityLabel,
  datingStatLabel,
  weatherLabel as weatherLabelTr,
  dayLabel,
} from '../i18n/sharedLabels';
import { Portrait } from '../components/Portrait';
import { Icon } from '../components/Icon';
import { CrisisResources } from '../components/CrisisResources';
import { DatingBars, RelationshipBars } from '../components/StatBars';
import { Banner, Empty, Loader, ConfirmDialog } from '../components/ui';
import './profile.page.css';

function ago(ts: number, t: TFunc): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return t('profile.ago.justNow');
  const m = Math.floor(s / 60);
  if (m < 60) return t('profile.ago.minutes', { m });
  const h = Math.floor(m / 60);
  if (h < 24) return t('profile.ago.hours', { h });
  return t('profile.ago.days', { d: Math.floor(h / 24) });
}

/** A friendly summary of where the relationship stands — uses the shared band
 *  labels (single source of truth in social.ts) so it never drifts. */
function relationshipStatus(rel: Relationship, t: TFunc): string {
  const label = relationshipStage(rel).label;
  const display = label.charAt(0).toUpperCase() + label.slice(1);
  return rel.tension >= 60 ? `${display}${t('profile.tenseSuffix')}` : display;
}

const weatherIcon = (k: string) => WEATHER_ICONS[k as keyof typeof WEATHER_ICONS] ?? '';

// ---------------------------------------------------------------------------
// Tabs — mirror the editor's stepped layout, read-only.
// ---------------------------------------------------------------------------

type TabId = 'overview' | 'about' | 'profile' | 'history' | 'memories';

const TABS: { id: TabId; labelKey: MessageKey }[] = [
  { id: 'overview', labelKey: 'profile.tab.overview' },
  { id: 'about',    labelKey: 'profile.tab.about' },
  { id: 'profile',  labelKey: 'profile.tab.profile' },
  { id: 'history',  labelKey: 'profile.tab.history' },
  { id: 'memories', labelKey: 'profile.tab.memories' },
];

export function CharacterProfile() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const t = useT();
  const { creatorMode, dayTick } = useAppData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const bundle = useAsync(() => api.getCharacterBundle(id), [id]);
  const sessions = useAsync(() => api.listConversations(), [id]);
  const chronicle = useAsync(() => api.getChronicle(id), [id]);
  const characters = useAsync(() => api.listCharacters(), []);
  // The character's world day, so we can tell "needs space" (still in the
  // post-breakup cooldown) from "open to reconciling" (cooldown elapsed).
  const worldId = bundle.data?.character.worldId ?? null;
  // dayTick keeps the post-breakup cooldown ("needs space" vs "open to
  // reconciling") live as the player ends days with this profile open.
  const worldState = useAsync(
    () => (worldId ? api.getWorldState(worldId) : Promise.resolve(null)),
    [worldId, dayTick],
  );

  const duplicate = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const copy = await api.duplicateCharacter(id);
      nav(`/characters/${copy.id}`); // navigates away; no need to clear busy
    } catch (e) {
      setBusy(false);
      alert(errorMessage(e));
    }
  };

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await api.deleteCharacter(id);
      nav('/characters');
    } catch (e) {
      setBusy(false);
      alert(errorMessage(e));
    }
  };

  const deleteMemory = async (memoryId: string) => {
    await api.deleteMemory(memoryId);
    bundle.reload();
  };

  return (
    <Loader state={bundle}>
      {({ character, relationship, memories }) => {
        const effective = effectiveDatingStats(character.datingStats, relationship.flags);
        const buffs = listActiveBuffs(relationship.flags);
        const storyFlags = Object.entries(relationship.flags)
          .filter(([k]) => !isInternalFlagKey(k))
          .map(([k, v]) => [k, humanizeStoryFlag(k, v)] as const)
          .filter((entry): entry is readonly [string, string] => entry[1] !== null);
        const convoCount = (sessions.data ?? []).filter((s: ConversationSession) => s.characterId === id).length;
        const status = currentStatus(relationship);

        // Endgame state: memorialized (gone), broken up, or on the rocks.
        const memorial = isMemorialized(relationship);
        const brokenUp = isBrokenUp(relationship);
        const onTheRocks = isOnTheRocks(relationship);
        const breakupDay = relationship.flags['breakup:day'];
        const worldDay = worldState.data?.day ?? null;
        const needsSpace =
          brokenUp &&
          typeof breakupDay === 'number' &&
          worldDay != null &&
          worldDay - breakupDay < RECONCILE_COOLDOWN_DAYS;

        const nameOf = (cid: string) => (characters.data ?? []).find((c) => c.id === cid)?.name ?? t('common.someone');
        const connections = character.links.filter((l) => l.targetId);

        const dates = chronicle.data?.sessionCount ?? 0;
        const toolTag = memorial
          ? t('profile.tag.inMemoriam')
          : brokenUp
            ? t('profile.tag.parted')
            : status !== 'none'
              ? statusLabel(t, status).toLowerCase()
              : relationshipStage(relationship).label;

        const hasAbout =
          !!character.personality.trim() ||
          !!character.speechStyle.trim() ||
          !!character.relationshipPreferences.trim() ||
          character.likes.length > 0 ||
          character.dislikes.length > 0 ||
          character.goals.length > 0 ||
          character.boundaries.length > 0;

        const hasProfile =
          !!character.appearance.trim() ||
          !!character.textingStyle.trim() ||
          !!character.onlinePersona.trim() ||
          !!character.loveLanguage.trim() ||
          !!character.roomDescription.trim() ||
          character.physicalNeeds.length > 0 ||
          character.physicalDesires.length > 0 ||
          character.physicalDislikes.length > 0 ||
          character.insecurities.length > 0 ||
          character.quirks.length > 0 ||
          character.favoriteWeather.length > 0 ||
          character.dislikedWeather.length > 0 ||
          character.employment != null;

        const hasHistory = !!chronicle.data && (!!chronicle.data.chronicle || chronicle.data.recentLines.length > 0);

        const panelClass = (tab: TabId) => `prof-panel stack ${activeTab === tab ? '' : 'prof-panel-hidden'}`;

        return (
          <div className="prof-layout">
            {/* ===== Masthead ===== */}
            <div className="framed prof-mast">
              <div className="prof-mast-titles">
                <div className="prof-mast-meta">
                  <span className="kicker">{t('profile.mast.kicker')}</span>
                  <span className="prof-mast-tag">{toolTag}</span>
                </div>
                <h1>{character.name}</h1>
                <div className="prof-mast-vitals">
                  {character.age}
                  <span className="sep">·</span>
                  {character.pronouns}
                  {character.gender !== 'unspecified' && (
                    <>
                      <span className="sep">·</span>
                      {genderLabel(t, character.gender)}
                    </>
                  )}
                  <span className="sep">·</span>
                  {relStyleLabel(t, character.relationshipStyle)}
                  {character.sexuality !== 'unspecified' &&
                    (creatorMode || relationship.flags['state:orientationRevealed'] === true) && (
                      <>
                        <span className="sep">·</span>
                        {sexualityLabel(t, character.sexuality)}
                      </>
                    )}
                </div>
                {character.shortDescription && <p>{character.shortDescription}</p>}
              </div>
              <div className="prof-mast-actions">
                {!memorial && (
                  <Link className="btn primary" to={`/chat?character=${character.id}`}>
                    <Icon name="date" size={16} /> {t('people.date')}
                  </Link>
                )}
                {creatorMode && (
                  <>
                    <Link className="btn" to={`/characters/${character.id}/edit`}>
                      <Icon name="edit" size={16} /> {t('common.edit')}
                    </Link>
                    <button className="btn ghost" onClick={duplicate} disabled={busy}>
                      <Icon name="duplicate" size={16} /> {t('common.duplicate')}
                    </button>
                    <button className="btn danger ghost" onClick={() => setConfirmDelete(true)} disabled={busy}>
                      <Icon name="trash" size={16} /> {t('common.delete')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Endgame banners — always visible, above the tabbed canvas */}
            {memorial && (
              <>
                <Banner kind="error">{t('profile.memorial.banner', { name: character.name })}</Banner>
                <CrisisResources />
              </>
            )}
            {!memorial && brokenUp && (
              <Banner kind="error">
                {t('profile.brokenUp.intro')}
                {needsSpace
                  ? t('profile.brokenUp.needsSpace', { name: character.name })
                  : t('profile.brokenUp.open', { name: character.name })}
              </Banner>
            )}
            {!memorial && !brokenUp && onTheRocks && (
              <Banner kind="info">{t('profile.onTheRocks', { name: character.name })}</Banner>
            )}

            {/* ===== Two-column canvas: portrait rail + tabbed content ===== */}
            <div className="prof-canvas">
              {/* Sticky portrait rail */}
              <aside className="prof-rail">
                <div className="prof-rail-plate framed">
                  <Portrait character={character} memorial={memorial} className="prof-rail-img" />
                  <div className="prof-rail-name">{character.name}</div>
                  <div className="prof-rail-meta">
                    {character.age} · {character.pronouns}
                  </div>
                  <div className="prof-rail-badges">
                    {memorial ? (
                      <span className="badge danger"><Icon name="remember" size={13} /> {t('profile.badge.inMemoriam')}</span>
                    ) : brokenUp ? (
                      <>
                        <span className="badge danger"><Icon name="breakup" size={13} /> {t('profile.badge.brokenUp')}</span>
                        <span className="badge warn">{needsSpace ? t('profile.badge.needsSpace') : t('profile.badge.openReconcile')}</span>
                      </>
                    ) : (
                      <>
                        <span className="badge accent">{relationshipStatus(relationship, t)}</span>
                        {status !== 'none' && (
                          <span className="badge accent">
                            <Icon name="affection" size={13} /> {statusLabel(t, status)}
                          </span>
                        )}
                        {onTheRocks && <span className="badge warn"><Icon name="warn" size={13} /> {t('profile.badge.onTheRocks')}</span>}
                      </>
                    )}
                  </div>
                  <div className="prof-rail-bars">
                    <RelationshipBars relationship={relationship} />
                  </div>
                  <div className="prof-rail-figs">
                    <div className="prof-rail-fig">
                      <span className="prof-rail-fig-n">{convoCount}</span>
                      <span className="prof-rail-fig-l">{t('profile.figs.chats')}</span>
                    </div>
                    <div className="prof-rail-fig">
                      <span className="prof-rail-fig-n">{dates}</span>
                      <span className="prof-rail-fig-l">{t('profile.figs.dates')}</span>
                    </div>
                    <div className="prof-rail-fig">
                      <span className="prof-rail-fig-n">{memories.length}</span>
                      <span className="prof-rail-fig-l">{t('profile.figs.memories')}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Content column */}
              <div className="prof-main stack">
                {/* Tab nav */}
                <nav className="prof-tabs" aria-label={t('profile.tabsAria')}>
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`prof-tab ${activeTab === tab.id ? 'prof-tab-active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {t(tab.labelKey)}
                    </button>
                  ))}
                </nav>

                {/* ---- Tab: Overview ---- */}
                <div className={panelClass('overview')}>
                  <div className="card">
                    <div className="section-head">
                      <div className="titles">
                        <span className="kicker">{t('profile.overview.kicker')}</span>
                        <h2>{t('profile.overview.title')}</h2>
                      </div>
                      <span className="trail" />
                    </div>
                    <div className="prof-gaugegrid">
                      <RelationshipBars relationship={relationship} />
                    </div>
                    {(buffs.length > 0 || storyFlags.length > 0) && (
                      <div className="prof-meta-row">
                        {buffs.length > 0 && (
                          <div>
                            <div className="prof-subhead">{t('profile.overview.buffs')}</div>
                            <div className="tags">
                              {buffs.map((b) => (
                                <span className={`badge prof-buff${b.delta < 0 ? ' down' : ''}`} key={b.stat}>
                                  {b.delta >= 0 ? '+' : ''}
                                  {b.delta} {datingStatLabel(t, b.stat)} <span className="left">{t('profile.overview.buffLeft', { n: b.remaining })}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {storyFlags.length > 0 && (
                          <div>
                            <div className="prof-subhead">{t('profile.overview.story')}</div>
                            <div className="tags">
                              {storyFlags.map(([k, label]) => (
                                <span className="tag prof-flag" key={k}>
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <div className="section-head">
                      <div className="titles">
                        <span className="kicker">{t('profile.dating.kicker')}</span>
                        <h2>{t('profile.dating.title')}</h2>
                      </div>
                      <span className="trail" />
                      {buffs.length > 0 && <span className="muted">{t('profile.dating.withBuffs')}</span>}
                    </div>
                    <div className="prof-gaugegrid">
                      <DatingBars stats={effective} />
                    </div>
                  </div>

                  {connections.length > 0 && (
                    <div className="card">
                      <div className="section-head">
                        <div className="titles">
                          <span className="kicker">{t('profile.conns.kicker')}</span>
                          <h2>{t('profile.conns.title')}</h2>
                        </div>
                        <span className="trail" />
                      </div>
                      <div className="prof-conns">
                        {connections.map((l, i) => (
                          <Link className="prof-conn" to={`/characters/${l.targetId}`} key={i}>
                            <span className="prof-conn-kind">{linkLabel(t, l.kind)}</span>
                            <span className="prof-conn-name flex-fill">{nameOf(l.targetId)}</span>
                            <Icon name="chevronRight" size={15} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ---- Tab: About ---- */}
                <div className={panelClass('about')}>
                  {hasAbout ? (
                    <>
                      <div className="card">
                        <div className="section-head">
                          <div className="titles">
                            <span className="kicker">{t('profile.about.kicker')}</span>
                            <h2>{t('profile.about.title')}</h2>
                          </div>
                          <span className="trail" />
                        </div>
                        {character.personality && <p className="prof-personality">{character.personality}</p>}
                        <Prose label={t('profile.about.speechStyle')} value={character.speechStyle} />
                        <Prose label={t('profile.about.wants')} value={character.relationshipPreferences} />
                      </div>

                      {(character.likes.length > 0 ||
                        character.dislikes.length > 0 ||
                        character.goals.length > 0 ||
                        character.boundaries.length > 0) && (
                        <div className="card">
                          <div className="section-head">
                            <div className="titles">
                              <span className="kicker">{t('profile.traits.kicker')}</span>
                              <h2>{t('profile.traits.title')}</h2>
                            </div>
                            <span className="trail" />
                          </div>
                          <div className="prof-taxons">
                            <TagRow label={t('profile.traits.likes')} items={character.likes} variant="like" />
                            <TagRow label={t('profile.traits.dislikes')} items={character.dislikes} variant="dislike" />
                            <TagRow label={t('profile.traits.goals')} items={character.goals} />
                            <TagRow label={t('profile.traits.boundaries')} items={character.boundaries} />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="card">
                      <Empty icon={<Icon name="people" size={34} />} title={t('profile.about.emptyTitle')}>
                        <p className="muted">{t('profile.about.emptyLede', { name: character.name })}</p>
                      </Empty>
                    </div>
                  )}
                </div>

                {/* ---- Tab: Profile ---- */}
                <div className={panelClass('profile')}>
                  {hasProfile ? (
                    <>
                      {(character.appearance.trim() ||
                        character.textingStyle.trim() ||
                        character.onlinePersona.trim() ||
                        character.loveLanguage.trim() ||
                        character.employment != null) && (
                        <div className="card">
                          <div className="section-head">
                            <div className="titles">
                              <span className="kicker">{t('profile.presence.kicker')}</span>
                              <h2>{t('profile.presence.title')}</h2>
                            </div>
                            <span className="trail" />
                          </div>
                          <Prose label={t('profile.presence.appearance')} value={character.appearance} />
                          <Prose label={t('profile.presence.textingStyle')} value={character.textingStyle} />
                          <Prose label={t('profile.presence.onlinePersona')} value={character.onlinePersona} />
                          <Prose label={t('profile.presence.loveLanguage')} value={character.loveLanguage} />
                          {character.employment && (
                            <div className="prof-detail">
                              <div className="prof-detail-label">{t('profile.presence.work')}</div>
                              <p className="prof-detail-text">
                                {t('profile.presence.workLine', {
                                  title: character.employment.title,
                                  place: character.employment.place,
                                  shift: character.employment.shiftPhase,
                                })}
                                {character.employment.workdays.length > 0 &&
                                  ` · ${character.employment.workdays.map((d) => (DAYS_OF_WEEK[d] ? dayLabel(t, DAYS_OF_WEEK[d]).slice(0, 3) : '')).join(' ')}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {(character.physicalNeeds.length > 0 ||
                        character.physicalDesires.length > 0 ||
                        character.physicalDislikes.length > 0 ||
                        character.insecurities.length > 0 ||
                        character.quirks.length > 0) && (
                        <div className="card">
                          <div className="section-head">
                            <div className="titles">
                              <span className="kicker">{t('profile.chem.kicker')}</span>
                              <h2>{t('profile.chem.title')}</h2>
                            </div>
                            <span className="trail" />
                          </div>
                          <div className="prof-taxons">
                            <TagRow label={t('profile.chem.physicalNeeds')} items={character.physicalNeeds} />
                            <TagRow label={t('profile.chem.physicalDesires')} items={character.physicalDesires} variant="like" />
                            <TagRow label={t('profile.chem.physicalDislikes')} items={character.physicalDislikes} variant="dislike" />
                            <TagRow label={t('profile.chem.insecurities')} items={character.insecurities} />
                            <TagRow label={t('profile.chem.quirks')} items={character.quirks} />
                          </div>
                        </div>
                      )}

                      {(character.favoriteWeather.length > 0 || character.dislikedWeather.length > 0) && (
                        <div className="card">
                          <div className="section-head">
                            <div className="titles">
                              <span className="kicker">{t('profile.weather.kicker')}</span>
                              <h2>{t('profile.weather.title')}</h2>
                            </div>
                            <span className="trail" />
                          </div>
                          <div className="prof-weather">
                            {character.favoriteWeather.map((k) => (
                              <span className="prof-weather-chip fav" key={`f-${k}`}>
                                ♥ {weatherIcon(k)} {weatherLabelTr(t, k)}
                              </span>
                            ))}
                            {character.dislikedWeather.map((k) => (
                              <span className="prof-weather-chip dis" key={`d-${k}`}>
                                ✕ {weatherIcon(k)} {weatherLabelTr(t, k)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {character.roomDescription.trim() && (
                        <div className="card">
                          <div className="section-head">
                            <div className="titles">
                              <span className="kicker">{t('profile.space.kicker')}</span>
                              <h2>{t('profile.space.title')}</h2>
                            </div>
                            <span className="trail" />
                          </div>
                          <p className="prof-personality">{character.roomDescription}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="card">
                      <Empty icon={<Icon name="phone" size={34} />} title={t('profile.profile.emptyTitle')}>
                        <p className="muted">{t('profile.profile.emptyLede')}</p>
                      </Empty>
                    </div>
                  )}
                </div>

                {/* ---- Tab: History ---- */}
                <div className={panelClass('history')}>
                  {hasHistory ? (
                    <div className="card">
                      <div className="section-head">
                        <div className="titles">
                          <span className="kicker">{t('profile.history.kicker')}</span>
                          <h2>{t('profile.history.title')}</h2>
                        </div>
                        <span className="trail" />
                        <span className="readout">
                          <span className="num">{chronicle.data!.sessionCount}</span> {t('profile.figs.dates')}
                        </span>
                      </div>
                      {chronicle.data!.chronicle && <div className="prof-chronicle">{chronicle.data!.chronicle}</div>}
                      {chronicle.data!.recentLines.length > 0 && (
                        <ul className="prof-log">
                          {chronicle.data!.recentLines.map((l, i) => (
                            <li key={i} className="prof-log-line">
                              <span className="prof-log-day">{t('profile.history.day', { day: l.day })}</span>
                              <span>{l.line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="card">
                      <Empty icon={<Icon name="date" size={34} />} title={t('profile.history.emptyTitle')}>
                        <p className="muted">{t('profile.history.emptyLede', { name: character.name })}</p>
                      </Empty>
                    </div>
                  )}
                </div>

                {/* ---- Tab: Memories ---- */}
                <div className={panelClass('memories')}>
                  <MemoriesSection memories={memories} characterName={character.name} onDelete={deleteMemory} t={t} />
                </div>
              </div>
            </div>

            {bundle.error && <Banner kind="error">{bundle.error}</Banner>}

            {confirmDelete && (
              <ConfirmDialog
                title={t('people.delete.title', { name: character.name })}
                body={t('people.delete.body')}
                confirmLabel={t('common.delete')}
                danger
                busy={busy}
                onConfirm={remove}
                onCancel={() => setConfirmDelete(false)}
              />
            )}
          </div>
        );
      }}
    </Loader>
  );
}

// ---------------------------------------------------------------------------
// Read-only field helpers — a labeled prose block / tag row, hidden when empty.
// ---------------------------------------------------------------------------

function Prose({ label, value }: { label: string; value: string }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="prof-detail">
      <div className="prof-detail-label">{label}</div>
      <p className="prof-detail-text">{value}</p>
    </div>
  );
}

function TagRow({ label, items, variant }: { label: string; items: string[]; variant?: 'like' | 'dislike' }) {
  if (items.length === 0) return null;
  const cls = variant === 'like' ? 'prof-tag-like' : variant === 'dislike' ? 'prof-tag-dislike' : '';
  return (
    <div className="prof-detail">
      <div className="prof-detail-label">{label}</div>
      <div className="tags">
        {items.map((t) => (
          <span className={`tag ${cls}`} key={t}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function MemoriesSection({
  memories,
  characterName,
  onDelete,
  t,
}: {
  memories: CharacterMemory[];
  characterName: string;
  onDelete: (id: string) => void;
  t: TFunc;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="card">
      <div className="section-head">
        <div className="titles">
          <span className="kicker">{t('profile.mem.kicker')}</span>
          <h2>{t('profile.mem.title')}</h2>
        </div>
        <span className="trail" />
        <span className="readout">
          <span className="num">{memories.length}</span> {t('profile.mem.kept')}
        </span>
        {memories.length > 0 && (
          <button className="btn sm ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <Icon name={open ? 'chevronDown' : 'chevronRight'} size={15} /> {open ? t('common.hide') : t('common.show')}
          </button>
        )}
      </div>
      {memories.length === 0 ? (
        <Empty icon={<Icon name="remember" size={34} />} title={t('profile.mem.emptyTitle')}>
          <p className="muted">{t('profile.mem.emptyLede')}</p>
        </Empty>
      ) : open ? (
        <>
          <p className="hint" style={{ marginTop: 0 }}>{t('profile.mem.lede', { name: characterName })}</p>
          <MemoryList memories={memories} onDelete={onDelete} t={t} />
        </>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          {t(memories.length === 1 ? 'profile.mem.collapsedPrefixOne' : 'profile.mem.collapsedPrefixMany', {
            count: memories.length,
          })}
          <strong>{t('common.show')}</strong>
          {t('profile.mem.collapsedSuffix')}
        </p>
      )}
    </div>
  );
}

function MemoryList({
  memories,
  onDelete,
  t,
}: {
  memories: CharacterMemory[];
  onDelete: (id: string) => void;
  t: TFunc;
}) {
  return (
    <div className="prof-mem-list">
      {memories.map((m) => (
        <div className="prof-mem" key={m.id}>
          <span
            className="prof-mem-pips"
            title={t('profile.mem.importanceTitle', { n: m.importance })}
            aria-label={t('profile.mem.importanceAria', { n: m.importance })}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`prof-pip${i < m.importance ? ' on' : ''}`} />
            ))}
          </span>
          <div className="flex-fill">
            <div className="prof-mem-text">{m.text}</div>
            <div className="prof-mem-meta">
              <small className={`prof-mem-src${m.sourceEventId ? ' date' : ''}`}>
                {m.sourceEventId ? (
                  <><Icon name="date" size={12} /> {t('profile.mem.fromDate')}</>
                ) : (
                  <><Icon name="edit" size={12} /> {t('profile.mem.addedManually')}</>
                )}
              </small>
              <small className="prof-mem-src">· {ago(m.createdAt, t)}</small>
              {m.tags.map((tag) => (
                <span className="tag prof-mem-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            className="btn sm danger ghost prof-mem-del"
            onClick={() => onDelete(m.id)}
            aria-label={t('profile.mem.deleteAria')}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
