import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PHASE_ICONS,
  GENDER_LABELS,
  SEXUALITY_LABELS,
  deriveCalendar,
  type Character,
  type Gender,
  type PhoneInbox,
  type Sexuality,
  type World,
  type WorldState,
} from '@dsim/shared';
import { api } from '../lib/api';
import { useAsync, errorMessage } from '../lib/hooks';
import { useAppData } from '../state/app-context';
import { useT } from '../i18n';
import type { MessageKey } from '../i18n/locales/en';
import { phaseLabel, dayLabel, genderLabel, sexualityLabel } from '../i18n/sharedLabels';
import { Portrait } from '../components/Portrait';
import { Icon, type IconName } from '../components/Icon';
import { Banner, ConfirmDialog, Field, Spinner } from '../components/ui';
import './worldselect.page.css';

/** The deliberate "which world am I playing?" landing page. Reachable at any time
 *  via the "Switch world" link, and the app's entry point when no world is active. */
export function WorldSelector() {
  const { worlds, worldsLoaded, activeWorldId, setActiveWorld, reloadWorlds, creatorMode } = useAppData();
  const navigate = useNavigate();
  const t = useT();
  const [pendingDelete, setPendingDelete] = useState<World | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();

  const enter = (id: string) => {
    setActiveWorld(id);
    navigate('/');
  };

  const doDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(undefined);
    try {
      await api.deleteWorld(pendingDelete.id);
      await reloadWorlds();
      setPendingDelete(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  if (!worldsLoaded) {
    return (
      <div className="wsel">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="wsel">
      <div className="wsel-atmosphere" aria-hidden="true" />
      <header className="wsel-head">
        <div className="kicker">{t('world.select.eyebrow')}</div>
        <h1 className="wsel-title">{t('world.select.title')}</h1>
        <p className="wsel-sub">{t('world.select.sub')}</p>
      </header>

      {error && <Banner kind="error">{error}</Banner>}

      <div className="wsel-grid">
        {worlds.map((w) => (
          <WorldCard
            key={w.id}
            world={w}
            isActive={w.id === activeWorldId}
            onEnter={() => enter(w.id)}
            onDelete={creatorMode ? () => setPendingDelete(w) : undefined}
          />
        ))}
        <button className="wsel-new" onClick={() => navigate('/worlds/new')}>
          <span className="wsel-new-mark">
            <Icon name="plus" size={30} />
          </span>
          <span className="wsel-new-title">{t('world.select.newTitle')}</span>
          <span className="wsel-new-sub">{t('world.select.newSub')}</span>
        </button>
      </div>

      {worlds.length === 0 && (
        <p className="wsel-empty-note">{t('world.select.empty')}</p>
      )}

      {pendingDelete && (
        <ConfirmDialog
          kicker={t('world.delete.kicker')}
          title={t('world.delete.title', { name: pendingDelete.name })}
          body={t('world.delete.body')}
          confirmLabel={t('world.delete.confirm')}
          danger
          busy={deleting}
          onConfirm={doDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

function WorldCard({
  world,
  isActive,
  onEnter,
  onDelete,
}: {
  world: World;
  isActive: boolean;
  onEnter: () => void;
  onDelete?: () => void;
}) {
  const t = useT();
  const data = useAsync(
    () =>
      Promise.all([api.getWorldState(world.id), api.listCharacters(world.id), api.phoneInbox(world.id)]) as Promise<
        [WorldState, Character[], PhoneInbox]
      >,
    [world.id],
  );

  const [state, cast, inbox] = data.data ?? [];
  const cal = state ? deriveCalendar(state.day) : null;
  const unread = inbox ? inbox.unreadTexts + inbox.unreadEmails + inbox.feedUnread : 0;

  return (
    <div className={`wsel-card framed bracketed${isActive ? ' is-active' : ''}`}>
      {isActive && <span className="wsel-current">{t('world.card.current')}</span>}
      <div className="wsel-card-body">
        <div className="wsel-card-head">
          <h2 className="wsel-card-name">{world.name}</h2>
          {world.tone && <div className="wsel-card-tone">{world.tone}</div>}
        </div>
        {world.summary && <p className="wsel-card-summary">{world.summary}</p>}

        {data.loading && !state ? (
          <div className="wsel-card-loading">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="wsel-stats">
              {state && (
                <div className="wsel-stat">
                  <span className="wsel-stat-k">{t('world.card.day')}</span>
                  <span className="wsel-stat-v">
                    <span className="wsel-phase">{PHASE_ICONS[state.phase]}</span> {state.day}
                  </span>
                  <span className="wsel-stat-sub">
                    {phaseLabel(t, state.phase)}
                    {cal ? ` · ${dayLabel(t, cal.dayOfWeek)}` : ''}
                  </span>
                </div>
              )}
              <div className="wsel-stat">
                <span className="wsel-stat-k">{t('world.card.people')}</span>
                <span className="wsel-stat-v">{cast?.length ?? 0}</span>
                <span className="wsel-stat-sub">{t('world.card.inCircle')}</span>
              </div>
              {unread > 0 && (
                <div className="wsel-stat">
                  <span className="wsel-stat-k">{t('world.card.phone')}</span>
                  <span className="wsel-stat-v wsel-unread">{unread}</span>
                  <span className="wsel-stat-sub">{t('world.card.unread')}</span>
                </div>
              )}
            </div>

            {cast && cast.length > 0 && (
              <div className="wsel-cast">
                {cast.slice(0, 7).map((c) => (
                  <span className="wsel-cast-plate" key={c.id} title={c.name}>
                    <Portrait character={c} />
                  </span>
                ))}
                {cast.length > 7 && <span className="wsel-cast-more">+{cast.length - 7}</span>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="wsel-card-actions">
        <button className="btn primary flex-fill" onClick={onEnter}>
          {isActive ? t('world.card.continue') : t('world.card.enter')} <Icon name="chevronRight" size={16} />
        </button>
        {onDelete && (
          <button
            className="btn danger ghost"
            onClick={onDelete}
            title={t('world.card.deleteWorld')}
            aria-label={t('world.card.deleteWorld')}
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

// --- New-world onboarding ---------------------------------------------------

const PRONOUN_OPTIONS = ['she/her', 'he/him', 'they/them'];

const HOW_TO_PLAY: { icon: IconName; textKey: MessageKey }[] = [
  { icon: 'date', textKey: 'world.onb.howto.dates' },
  { icon: 'people', textKey: 'world.onb.howto.people' },
  { icon: 'phone', textKey: 'world.onb.howto.phone' },
  { icon: 'shop', textKey: 'world.onb.howto.shop' },
  { icon: 'recap', textKey: 'world.onb.howto.recap' },
  { icon: 'worlds', textKey: 'world.onb.howto.worlds' },
];

const STEP_TITLE_KEYS: MessageKey[] = [
  'world.onb.step1Title',
  'world.onb.step2Title',
  'world.onb.step3Title',
  'world.onb.step4Title',
];

/** A guided first-run for a new world: set the scene (blank or cloned from a save),
 *  set up your persona, import people from other worlds, then a how-to-play welcome. */
export function WorldOnboarding() {
  const { worlds, reloadWorlds, setActiveWorld, reloadPlayer } = useAppData();
  const navigate = useNavigate();
  const t = useT();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'blank' | 'clone'>('blank');
  const [sourceWorldId, setSourceWorldId] = useState<string>('');
  const [worldForm, setWorldForm] = useState({ name: '', summary: '', tone: '' });
  const [persona, setPersona] = useState<{
    name: string;
    pronouns: string;
    gender: Gender;
    sexuality: Sexuality;
    personaNotes: string;
  }>({ name: '', pronouns: 'they/them', gender: 'unspecified', sexuality: 'unspecified', personaNotes: '' });
  const [world, setWorld] = useState<World | null>(null);
  const [importIds, setImportIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const canClone = worlds.length > 0;

  const pickSource = (id: string) => {
    setSourceWorldId(id);
    const src = worlds.find((w) => w.id === id);
    if (src && !worldForm.name.trim()) setWorldForm((f) => ({ ...f, name: `${src.name} (new save)` }));
  };

  const createTheWorld = async () => {
    if (!worldForm.name.trim()) {
      setError(t('world.onb.errNameRequired'));
      return;
    }
    if (mode === 'clone' && !sourceWorldId) {
      setError(t('world.onb.errChooseSource'));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const w =
        mode === 'clone'
          ? await api.cloneWorld(sourceWorldId, worldForm.name.trim())
          : await api.createWorld({
              name: worldForm.name.trim(),
              summary: worldForm.summary.trim(),
              tone: worldForm.tone.trim(),
            });
      setWorld(w);
      await reloadWorlds();
      setStep(2);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const savePersona = async () => {
    if (!world) return;
    setBusy(true);
    setError(undefined);
    try {
      await api.updatePlayer(
        {
          name: persona.name.trim() || t('common.you'),
          pronouns: persona.pronouns,
          gender: persona.gender,
          sexuality: persona.sexuality,
          personaNotes: persona.personaNotes.trim(),
        },
        world.id,
      );
      setStep(3);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const importThenContinue = async () => {
    if (!world) return;
    setBusy(true);
    setError(undefined);
    try {
      if (importIds.size > 0) await api.importCharacters(world.id, [...importIds]);
      setStep(4);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleImport = (id: string) =>
    setImportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const finish = () => {
    if (!world) return;
    setActiveWorld(world.id);
    void reloadPlayer();
    navigate('/');
  };

  return (
    <div className="wsel wonb">
      <div className="wsel-atmosphere" aria-hidden="true" />
      <header className="wsel-head">
        <div className="kicker">{t('world.onb.stepLabel', { step })}</div>
        <h1 className="wsel-title">
          {step === 4
            ? t('world.onb.welcomeTitle', { name: world?.name ?? t('world.onb.yourWorldFallback') })
            : t(STEP_TITLE_KEYS[step - 1] ?? 'world.onb.step1Title')}
        </h1>
      </header>

      <div className="wonb-steps" aria-hidden="true">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={`wonb-pip${n <= step ? ' on' : ''}`} />
        ))}
      </div>

      {error && <Banner kind="error">{error}</Banner>}

      <div className="framed wonb-panel">
        {step === 1 && (
          <>
            {canClone && (
              <div className="wonb-mode">
                <button
                  className={`wonb-mode-opt${mode === 'blank' ? ' on' : ''}`}
                  onClick={() => setMode('blank')}
                  type="button"
                >
                  <span className="wonb-mode-title">{t('world.onb.modeFreshTitle')}</span>
                  <span className="wonb-mode-sub">{t('world.onb.modeFreshSub')}</span>
                </button>
                <button
                  className={`wonb-mode-opt${mode === 'clone' ? ' on' : ''}`}
                  onClick={() => setMode('clone')}
                  type="button"
                >
                  <span className="wonb-mode-title">{t('world.onb.modeCloneTitle')}</span>
                  <span className="wonb-mode-sub">{t('world.onb.modeCloneSub')}</span>
                </button>
              </div>
            )}

            {mode === 'clone' && canClone ? (
              <>
                <p className="wonb-flavor">{t('world.onb.cloneFlavor')}</p>
                <div className="wonb-sources">
                  {worlds.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={`wonb-source${sourceWorldId === w.id ? ' on' : ''}`}
                      onClick={() => pickSource(w.id)}
                    >
                      <span className="wonb-source-name">{w.name}</span>
                      {w.summary && <span className="wonb-source-sum truncate">{w.summary}</span>}
                    </button>
                  ))}
                </div>
                <Field label={t('world.onb.cloneNameLabel')}>
                  <input
                    value={worldForm.name}
                    placeholder={t('world.onb.cloneNamePlaceholder')}
                    onChange={(e) => setWorldForm({ ...worldForm, name: e.target.value })}
                  />
                </Field>
              </>
            ) : (
              <>
                <p className="wonb-flavor">{t('world.onb.blankFlavor')}</p>
                <Field label={t('world.onb.nameLabel')}>
                  <input
                    autoFocus
                    value={worldForm.name}
                    placeholder={t('world.onb.namePlaceholder')}
                    onChange={(e) => setWorldForm({ ...worldForm, name: e.target.value })}
                  />
                </Field>
                <Field label={t('world.onb.summaryLabel')} hint={t('world.onb.summaryHint')}>
                  <input
                    value={worldForm.summary}
                    placeholder={t('world.onb.summaryPlaceholder')}
                    onChange={(e) => setWorldForm({ ...worldForm, summary: e.target.value })}
                  />
                </Field>
                <Field label={t('world.onb.toneLabel')} hint={t('world.onb.toneHint')}>
                  <input
                    value={worldForm.tone}
                    placeholder={t('world.onb.tonePlaceholder')}
                    onChange={(e) => setWorldForm({ ...worldForm, tone: e.target.value })}
                  />
                </Field>
              </>
            )}

            <div className="row end wonb-actions">
              <button className="btn ghost" onClick={() => navigate('/worlds')} disabled={busy}>
                {t('common.back')}
              </button>
              <button className="btn primary" onClick={createTheWorld} disabled={busy}>
                {busy ? t('world.onb.creating') : t('common.continue')} <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="wonb-flavor">{t('world.onb.personaFlavor')}</p>
            <Field label={t('world.onb.yourName')}>
              <input
                autoFocus
                value={persona.name}
                placeholder={t('world.onb.yourNamePlaceholder')}
                onChange={(e) => setPersona({ ...persona, name: e.target.value })}
              />
            </Field>
            <Field label={t('world.onb.pronouns')}>
              <select value={persona.pronouns} onChange={(e) => setPersona({ ...persona, pronouns: e.target.value })}>
                {PRONOUN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
            <div className="inline-fields">
              <Field label={t('world.onb.gender')} hint={t('world.onb.genderHint')}>
                <select value={persona.gender} onChange={(e) => setPersona({ ...persona, gender: e.target.value as Gender })}>
                  {Object.keys(GENDER_LABELS).map((k) => (
                    <option key={k} value={k}>
                      {genderLabel(t, k)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('world.onb.sexuality')} hint={t('world.onb.sexualityHint')}>
                <select
                  value={persona.sexuality}
                  onChange={(e) => setPersona({ ...persona, sexuality: e.target.value as Sexuality })}
                >
                  {Object.keys(SEXUALITY_LABELS).map((k) => (
                    <option key={k} value={k}>
                      {sexualityLabel(t, k)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={t('world.onb.aboutYou')} hint={t('world.onb.aboutYouHint')}>
              <textarea
                value={persona.personaNotes}
                placeholder={t('world.onb.aboutYouPlaceholder')}
                onChange={(e) => setPersona({ ...persona, personaNotes: e.target.value })}
              />
            </Field>
            <div className="row end wonb-actions">
              <button className="btn ghost" onClick={() => setStep(1)} disabled={busy}>
                {t('common.back')}
              </button>
              <button className="btn primary" onClick={savePersona} disabled={busy}>
                {busy ? t('common.saving') : t('common.continue')} <Icon name="chevronRight" size={16} />
              </button>
            </div>
          </>
        )}

        {step === 3 && world && (
          <ImportPeopleStep
            newWorldId={world.id}
            selected={importIds}
            onToggle={toggleImport}
            busy={busy}
            onBack={() => setStep(2)}
            onContinue={importThenContinue}
          />
        )}

        {step === 4 && world && <OnboardWelcome world={world} persona={persona.name.trim() || t('common.you')} onEnter={finish} />}
      </div>
    </div>
  );
}

/** Step 3 — copy people from your OTHER worlds into the new one (optional). */
function ImportPeopleStep({
  newWorldId,
  selected,
  onToggle,
  busy,
  onBack,
  onContinue,
}: {
  newWorldId: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
  busy: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  const { worlds } = useAppData();
  const t = useT();
  const all = useAsync(() => api.listCharacters(), []);
  const others = (all.data ?? []).filter((c) => c.worldId && c.worldId !== newWorldId);

  const byWorld = new Map<string, Character[]>();
  for (const c of others) {
    const arr = byWorld.get(c.worldId!) ?? [];
    arr.push(c);
    byWorld.set(c.worldId!, arr);
  }
  const worldName = (id: string) => worlds.find((w) => w.id === id)?.name ?? t('world.onb.anotherWorld');

  return (
    <>
      <p className="wonb-flavor">{t('world.onb.importFlavor')}</p>

      {all.loading ? (
        <Spinner />
      ) : others.length === 0 ? (
        <div className="wonb-blank">
          <p>{t('world.onb.importEmpty')}</p>
        </div>
      ) : (
        <div className="wonb-import">
          {[...byWorld.entries()].map(([wid, chars]) => (
            <div key={wid} className="wonb-import-world">
              <div className="wonb-cast-head">
                <span className="kicker">{t('world.onb.importFrom', { world: worldName(wid) })}</span>
                <span className="trail" />
              </div>
              <div className="wonb-import-grid">
                {chars.map((c) => {
                  const on = selected.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`wonb-import-plate${on ? ' on' : ''}`}
                      onClick={() => onToggle(c.id)}
                      title={c.shortDescription || c.name}
                    >
                      <Portrait character={c} />
                      <span className="wonb-cast-name truncate">{c.name}</span>
                      {on && (
                        <span className="wonb-import-check">
                          <Icon name="check" size={14} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row end wonb-actions">
        <button className="btn ghost" onClick={onBack} disabled={busy}>
          {t('common.back')}
        </button>
        <button className="btn primary" onClick={onContinue} disabled={busy}>
          {busy
            ? t('world.onb.importing')
            : selected.size > 0
              ? t('world.onb.importContinue', { count: selected.size })
              : t('world.onb.skip')}{' '}
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </>
  );
}

/** The final onboarding beat: how-to-play + a preview of who lives in this world. */
function OnboardWelcome({ world, persona, onEnter }: { world: World; persona: string; onEnter: () => void }) {
  const { creatorMode } = useAppData();
  const t = useT();
  const cast = useAsync(() => api.listCharacters(world.id), [world.id]);
  const people = cast.data ?? [];

  return (
    <>
      <p className="wonb-flavor">
        {t('world.onb.welcomeFlavor', { persona, summary: world.summary || t('world.onb.defaultSummary') })}
      </p>

      <ul className="wonb-howto">
        {HOW_TO_PLAY.map((h, i) => (
          <li key={i}>
            <span className="wonb-howto-icon">
              <Icon name={h.icon} size={18} />
            </span>
            <span>{t(h.textKey)}</span>
          </li>
        ))}
      </ul>

      <div className="wonb-cast-head">
        <span className="kicker">{t('world.onb.meetHead')}</span>
        <span className="trail" />
      </div>

      {cast.loading ? (
        <Spinner />
      ) : people.length > 0 ? (
        <div className="wonb-cast">
          {people.slice(0, 12).map((c) => (
            <div className="wonb-cast-card" key={c.id}>
              <Portrait character={c} />
              <span className="wonb-cast-name truncate">{c.name}</span>
              {c.shortDescription && <span className="wonb-cast-desc">{c.shortDescription}</span>}
            </div>
          ))}
        </div>
      ) : (
        <div className="wonb-blank">
          <p>
            {t('world.onb.blankCast')}
            {creatorMode ? t('world.onb.blankCastCreator') : t('world.onb.blankCastPlay')}
          </p>
        </div>
      )}

      <div className="row end wonb-actions">
        <button className="btn primary lg" onClick={onEnter}>
          {t('world.onb.enter', { name: world.name })} <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </>
  );
}
