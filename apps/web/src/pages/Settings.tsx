import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GENDER_LABELS,
  SEXUALITY_LABELS,
  type Gender,
  type Sexuality,
  type LlmHealthResult,
  type StructuredOutputMode,
  type EndpointMode,
} from '@dsim/shared';
import { api } from '../lib/api';
import { errorMessage } from '../lib/hooks';
import { useAppData } from '../state/app-context';
import { useI18n, LOCALES, type Locale } from '../i18n';
import { Banner, Field, Spinner } from '../components/ui';
import { Icon } from '../components/Icon';
import { CrisisResources } from '../components/CrisisResources';
import './settings.page.css';

interface Form {
  baseUrl: string;
  apiKey: string;
  model: string;
  visionModel: string;
  temperature: number;
  maxTokens: number;
  structuredMode: StructuredOutputMode;
  omitSchemaInPrompt: boolean;
  endpointMode: EndpointMode;
  maxRetries: number;
  nsfwEnabled: boolean;
  rapportCadence: 'every' | 'periodic';
  tragicOutcomesEnabled: boolean;
}

interface PlayerForm {
  name: string;
  pronouns: string;
  gender: Gender;
  sexuality: Sexuality;
  personaNotes: string;
}

export function Settings() {
  const { reloadPlayer, creatorMode, setCreatorMode, activeWorldId } = useAppData();
  const { locale, setLocale, t } = useI18n();
  const [player, setPlayer] = useState<PlayerForm | null>(null);
  const [playerSaved, setPlayerSaved] = useState(false);
  const [playerSaving, setPlayerSaving] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [health, setHealth] = useState<LlmHealthResult | null>(null);
  const [error, setError] = useState<string>();
  const [savedNote, setSavedNote] = useState<string>();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [nsfwModalOpen, setNsfwModalOpen] = useState(false);
  const [ackContent, setAckContent] = useState(false);
  const [ackAge, setAckAge] = useState(false);
  const [nsfwSaving, setNsfwSaving] = useState(false);
  const [tragicModalOpen, setTragicModalOpen] = useState(false);
  const [ackTragic, setAckTragic] = useState(false);
  const [tragicSaving, setTragicSaving] = useState(false);

  useEffect(() => {
    // A `cancelled` flag drops a superseded world's persona so a slow
    // getPlayer(A) can't overwrite (and then be saved over) getPlayer(B).
    let cancelled = false;
    void (async () => {
      try {
        const p = await api.getPlayer(activeWorldId ?? undefined);
        if (cancelled) return;
        setPlayer({ name: p.name, pronouns: p.pronouns, gender: p.gender, sexuality: p.sexuality, personaNotes: p.personaNotes });
      } catch {
        /* ignore */
      }
    })();
    void (async () => {
      try {
        const s = await api.getSettings();
        if (cancelled) return;
        setApiKeySet(s.apiKeySet);
        setForm({
          baseUrl: s.baseUrl,
          apiKey: '',
          model: s.model,
          visionModel: s.visionModel,
          temperature: s.temperature,
          maxTokens: s.maxTokens,
          structuredMode: s.structuredMode,
          omitSchemaInPrompt: s.omitSchemaInPrompt,
          endpointMode: s.endpointMode,
          maxRetries: s.maxRetries,
          nsfwEnabled: s.nsfwEnabled,
          rapportCadence: s.rapportCadence,
          tragicOutcomesEnabled: s.tragicOutcomesEnabled,
        });
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeWorldId]);

  if (!form) return <Spinner />;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const buildUpdate = () => {
    const update: Record<string, unknown> = {
      baseUrl: form.baseUrl,
      model: form.model,
      visionModel: form.visionModel,
      temperature: form.temperature,
      maxTokens: form.maxTokens,
      structuredMode: form.structuredMode,
      omitSchemaInPrompt: form.omitSchemaInPrompt,
      endpointMode: form.endpointMode,
      maxRetries: form.maxRetries,
      nsfwEnabled: form.nsfwEnabled,
      rapportCadence: form.rapportCadence,
      tragicOutcomesEnabled: form.tragicOutcomesEnabled,
    };
    if (form.apiKey) update.apiKey = form.apiKey;
    return update;
  };

  const save = async () => {
    setSaving(true);
    setSavedNote(undefined);
    setError(undefined);
    try {
      const s = await api.updateSettings(buildUpdate());
      setApiKeySet(s.apiKeySet);
      setForm((f) => (f ? { ...f, apiKey: '' } : f));
      setSavedNote(t('settings.saved'));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  // Persist the NSFW toggle on its own (a minimal PATCH) so enabling/disabling is
  // atomic with the acknowledgment and never depends on the main Save button.
  const persistNsfw = async (enabled: boolean): Promise<boolean> => {
    setNsfwSaving(true);
    setError(undefined);
    try {
      const s = await api.updateSettings({ nsfwEnabled: enabled });
      setApiKeySet(s.apiKeySet);
      setForm((f) => (f ? { ...f, nsfwEnabled: s.nsfwEnabled } : f));
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setNsfwSaving(false);
    }
  };

  const closeNsfwModal = () => {
    setNsfwModalOpen(false);
    setAckContent(false);
    setAckAge(false);
  };

  // Only close (and clear the acknowledgments) when the server actually accepted
  // the change — on failure keep the modal open with both boxes still checked.
  const confirmEnableNsfw = async () => {
    if (await persistNsfw(true)) closeNsfwModal();
  };

  // The dark "tragic outcomes" subtoggle persists on its own, atomically.
  const persistTragic = async (enabled: boolean): Promise<boolean> => {
    setTragicSaving(true);
    setError(undefined);
    try {
      const s = await api.updateSettings({ tragicOutcomesEnabled: enabled });
      setForm((f) => (f ? { ...f, tragicOutcomesEnabled: s.tragicOutcomesEnabled } : f));
      return true;
    } catch (e) {
      setError(errorMessage(e));
      return false;
    } finally {
      setTragicSaving(false);
    }
  };
  const closeTragicModal = () => {
    setTragicModalOpen(false);
    setAckTragic(false);
  };
  const confirmEnableTragic = async () => {
    if (await persistTragic(true)) closeTragicModal();
  };

  const savePlayer = async () => {
    if (!player) return;
    setPlayerSaving(true);
    setPlayerSaved(false);
    setError(undefined);
    try {
      await api.updatePlayer(player, activeWorldId ?? undefined);
      await reloadPlayer();
      setPlayerSaved(true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPlayerSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setHealth(null);
    setError(undefined);
    try {
      setHealth(await api.testLlm(buildUpdate()));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setTesting(false);
    }
  };

  const loadModels = async () => {
    if (loadingModels) return;
    setLoadingModels(true);
    try {
      const res = await api.listModels();
      setModels(res.models);
      if (!res.ok && res.error) setError(res.error);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <div className="stack set-page">
      <div className="page-head">
        <div className="kicker">{t('settings.head.kicker')}</div>
        <h1>{t('settings.head.title')}</h1>
        <p>{t('settings.head.lede')}</p>
      </div>
      {error && <Banner kind="error">{error}</Banner>}
      {savedNote && <Banner kind="ok">{savedNote}</Banner>}

      <div className="card set-section">
        <div className="section-head">
          <div className="titles">
            <div className="kicker">{t('settings.language.kicker')}</div>
            <h2>{t('settings.language.title')}</h2>
          </div>
          <div className="trail" />
        </div>
        <p className="set-lede">{t('settings.language.lede')}</p>
        <Field label={t('settings.language.label')}>
          <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            {Object.entries(LOCALES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="card set-section">
        <div className="section-head">
          <div className="titles">
            <div className="kicker">{t('settings.mode.kicker')}</div>
            <h2>{t('settings.mode.title')}</h2>
          </div>
          <div className="trail" />
        </div>
        <p className="set-lede">
          <strong>{t('settings.mode.playStrong')}</strong>{t('settings.mode.playDesc')}
          <strong>{t('settings.mode.creatorStrong')}</strong>{t('settings.mode.creatorDesc')}
          {t('settings.mode.ledeSuffix')}
        </p>
        <div className="set-choice">
          <button className={`btn sm ${!creatorMode ? 'primary' : ''}`} onClick={() => setCreatorMode(false)}>
            <Icon name="play" size={14} /> {t('settings.mode.playBtn')}
          </button>
          <button className={`btn sm ${creatorMode ? 'primary' : ''}`} onClick={() => setCreatorMode(true)}>
            <Icon name="edit" size={14} /> {t('settings.mode.creatorBtn')}
          </button>
        </div>
      </div>

      <div className="card set-section">
        <div className="section-head">
          <div className="titles">
            <div className="kicker">{t('settings.nsfw.kicker')}</div>
            <h2>{t('settings.nsfw.title')}</h2>
          </div>
          <div className="trail" />
        </div>
        <p className="set-lede">{t('settings.nsfw.lede')}</p>
        <div className="set-status-line">
          {form.nsfwEnabled ? (
            <>
              <span className="badge warn">{t('settings.nsfw.on')}</span>
              <button className="btn sm" onClick={() => persistNsfw(false)} disabled={nsfwSaving}>
                {nsfwSaving ? t('common.saving') : t('settings.nsfw.disable')}
              </button>
            </>
          ) : (
            <>
              <span className="badge">{t('common.off')}</span>
              <button className="btn sm danger" onClick={() => setNsfwModalOpen(true)} disabled={nsfwSaving}>
                {t('settings.nsfw.enable')}
              </button>
            </>
          )}
        </div>
        <p className="hint" style={{ marginBottom: 0, marginTop: 12 }}>{t('settings.nsfw.hint')}</p>

        {form.nsfwEnabled && (
          <div className="set-subtoggle">
            <div className="kicker">{t('settings.tragic.kicker')}</div>
            <h3 style={{ margin: '4px 0 6px' }}>{t('settings.tragic.title')}</h3>
            <p className="set-lede" style={{ marginTop: 0 }}>{t('settings.tragic.lede')}</p>
            <div className="set-status-line">
              {form.tragicOutcomesEnabled ? (
                <>
                  <span className="badge danger">{t('settings.tragic.on')}</span>
                  <button className="btn sm" onClick={() => persistTragic(false)} disabled={tragicSaving}>
                    {tragicSaving ? t('common.saving') : t('settings.tragic.disable')}
                  </button>
                </>
              ) : (
                <>
                  <span className="badge">{t('common.off')}</span>
                  <button className="btn sm danger" onClick={() => setTragicModalOpen(true)} disabled={tragicSaving}>
                    {t('settings.tragic.enable')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {player && (
        <div className="card set-section">
          <div className="section-head">
            <div className="titles">
              <div className="kicker">{t('settings.persona.kicker')}</div>
              <h2>{t('settings.persona.title')}</h2>
            </div>
            <div className="trail" />
          </div>
          <p className="set-lede">{t('settings.persona.lede')}</p>
          <div className="inline-fields">
            <Field label={t('settings.persona.name')}>
              <input value={player.name} onChange={(e) => setPlayer({ ...player, name: e.target.value })} />
            </Field>
            <Field label={t('settings.persona.pronouns')}>
              <input value={player.pronouns} onChange={(e) => setPlayer({ ...player, pronouns: e.target.value })} />
            </Field>
          </div>
          <div className="inline-fields">
            <Field label={t('settings.persona.gender')} hint={t('settings.persona.genderHint')}>
              <select value={player.gender} onChange={(e) => setPlayer({ ...player, gender: e.target.value as Gender })}>
                {Object.entries(GENDER_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('settings.persona.sexuality')} hint={t('settings.persona.sexualityHint')}>
              <select
                value={player.sexuality}
                onChange={(e) => setPlayer({ ...player, sexuality: e.target.value as Sexuality })}
              >
                {Object.entries(SEXUALITY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t('settings.persona.notes')} hint={t('settings.persona.notesHint')}>
            <textarea
              value={player.personaNotes}
              onChange={(e) => setPlayer({ ...player, personaNotes: e.target.value })}
            />
          </Field>
          <div className="row">
            <button className="btn primary" onClick={savePlayer} disabled={playerSaving}>
              {playerSaving ? t('common.saving') : t('settings.persona.save')}
            </button>
            {playerSaved && <span className="badge good">{t('settings.persona.saved')}</span>}
          </div>
        </div>
      )}

      {/* Signature element: the connection console — the technical heart of the
          page, presented as a chamfered instrument panel. */}
      <div className="framed set-console">
        <div className="set-console-head">
          <div>
            <div className="set-console-sub">{t('settings.console.sub')}</div>
            <div className="set-console-title">{t('settings.console.title')}</div>
          </div>
          <span className="set-console-dot">
            {form.baseUrl ? t('settings.console.endpointSet') : t('settings.console.noEndpoint')}
          </span>
        </div>

        <div className="set-console-grid">
          <div className="set-console-col">
            <div className="set-col-label">{t('settings.console.connection')}</div>
            <Field label={t('settings.console.baseUrl')} hint={t('settings.console.baseUrlHint')}>
              <input value={form.baseUrl} onChange={(e) => set('baseUrl', e.target.value)} />
            </Field>
            <Field
              label={t('settings.console.apiKey')}
              hint={apiKeySet ? t('settings.console.apiKeySetHint') : t('settings.console.apiKeyHint')}
            >
              <input
                type="password"
                placeholder={apiKeySet ? t('settings.console.apiKeySetPlaceholder') : t('settings.console.apiKeyPlaceholder')}
                value={form.apiKey}
                onChange={(e) => set('apiKey', e.target.value)}
              />
            </Field>
            <Field label={t('settings.console.model')}>
              <input value={form.model} onChange={(e) => set('model', e.target.value)} list="model-list" />
              <datalist id="model-list">
                {models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </Field>
            <Field label={t('settings.console.visionModel')} hint={t('settings.console.visionModelHint')}>
              <input
                value={form.visionModel}
                onChange={(e) => set('visionModel', e.target.value)}
                list="model-list"
                placeholder={t('settings.console.visionModelPlaceholder')}
              />
            </Field>
            <button className="btn sm" onClick={loadModels} disabled={loadingModels}>
              {loadingModels ? t('settings.console.loadingModels') : t('settings.console.loadModels')}
            </button>
          </div>

          <div className="set-console-col">
            <div className="set-col-label">{t('settings.console.generation')}</div>
            <Field label={t('settings.console.temperature', { value: form.temperature })}>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={form.temperature}
                onChange={(e) => set('temperature', Number(e.target.value))}
              />
            </Field>
            <Field label={t('settings.console.maxTokens')}>
              <input type="number" value={form.maxTokens} onChange={(e) => set('maxTokens', Number(e.target.value))} />
            </Field>
            <Field label={t('settings.console.structuredMode')} hint={t('settings.console.structuredModeHint')}>
              <select value={form.structuredMode} onChange={(e) => set('structuredMode', e.target.value as StructuredOutputMode)}>
                <option value="json_schema">json_schema</option>
                <option value="json_object">json_object</option>
                <option value="prompt_only">prompt_only</option>
              </select>
            </Field>
            <Field label={t('settings.console.omitSchema')} hint={t('settings.console.omitSchemaHint')}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.omitSchemaInPrompt}
                  onChange={(e) => set('omitSchemaInPrompt', e.target.checked)}
                />
                <span>{t('settings.console.omitSchemaLabel')}</span>
              </label>
            </Field>
            <Field label={t('settings.console.endpointMode')} hint={t('settings.console.endpointModeHint')}>
              <select value={form.endpointMode} onChange={(e) => set('endpointMode', e.target.value as EndpointMode)}>
                <option value="chat_completions">chat_completions</option>
                <option value="responses">responses</option>
              </select>
            </Field>
            <Field label={t('settings.console.retryLimit')} hint={t('settings.console.retryLimitHint')}>
              <input type="number" min={0} max={10} value={form.maxRetries} onChange={(e) => set('maxRetries', Number(e.target.value))} />
            </Field>
            <Field label={t('settings.console.cadence')} hint={t('settings.console.cadenceHint')}>
              <select value={form.rapportCadence} onChange={(e) => set('rapportCadence', e.target.value as 'every' | 'periodic')}>
                <option value="every">{t('settings.console.cadenceEvery')}</option>
                <option value="periodic">{t('settings.console.cadencePeriodic')}</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="set-console-foot">
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? t('common.saving') : t('settings.console.save')}
          </button>
          <button className="btn" onClick={test} disabled={testing}>
            {testing ? t('settings.console.testing') : <><Icon name="refresh" size={15} /> {t('settings.console.test')}</>}
          </button>
        </div>
      </div>

      {health && (
        <Banner kind={health.ok ? 'ok' : 'error'}>
          <strong>{health.ok ? t('settings.health.connected') : t('settings.health.failed')}</strong> {health.message}
          {health.latencyMs !== undefined && <> · {health.latencyMs}ms</>}
          {health.sample && (
            <>
              <br />
              {t('settings.health.sample')}<em>{health.sample}</em>
            </>
          )}
          {health.models && health.models.length > 0 && (
            <>
              <br />
              {t('settings.health.models')}{health.models.slice(0, 8).join(', ')}
            </>
          )}
        </Banner>
      )}

      {nsfwModalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={closeNsfwModal}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <div className="kicker">{t('settings.nsfwModal.kicker')}</div>
              <h2 style={{ marginTop: 0 }}>{t('settings.nsfwModal.title')}</h2>
              <p className="hint" style={{ marginTop: 0 }}>{t('settings.nsfwModal.intro')}</p>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '12px 0', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={ackContent}
                  onChange={(e) => setAckContent(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>{t('settings.nsfwModal.ackContent')}</span>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '12px 0', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={ackAge}
                  onChange={(e) => setAckAge(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span>{t('settings.nsfwModal.ackAge')}</span>
              </label>
              <p className="hint">{t('settings.nsfwModal.hint')}</p>
              {error && <Banner kind="error">{error}</Banner>}
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button className="btn ghost" onClick={closeNsfwModal} disabled={nsfwSaving}>
                  {t('common.cancel')}
                </button>
                <button
                  className="btn danger"
                  disabled={!(ackContent && ackAge) || nsfwSaving}
                  onClick={confirmEnableNsfw}
                >
                  {nsfwSaving ? t('common.enabling') : t('settings.nsfwModal.confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {tragicModalOpen &&
        createPortal(
          <div className="modal-overlay" onClick={closeTragicModal}>
            <div className="modal card" onClick={(e) => e.stopPropagation()}>
              <div className="kicker">{t('settings.tragicModal.kicker')}</div>
              <h2 style={{ marginTop: 0 }}>{t('settings.tragicModal.title')}</h2>
              <p className="hint" style={{ marginTop: 0 }}>{t('settings.tragicModal.intro')}</p>
              <CrisisResources />
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '12px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={ackTragic} onChange={(e) => setAckTragic(e.target.checked)} style={{ marginTop: 3 }} />
                <span>{t('settings.tragicModal.ack')}</span>
              </label>
              {error && <Banner kind="error">{error}</Banner>}
              <div className="row" style={{ justifyContent: 'flex-end' }}>
                <button className="btn ghost" onClick={closeTragicModal} disabled={tragicSaving}>
                  {t('common.cancel')}
                </button>
                <button className="btn danger" disabled={!ackTragic || tragicSaving} onClick={confirmEnableTragic}>
                  {tragicSaving ? t('common.enabling') : t('settings.tragicModal.confirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
