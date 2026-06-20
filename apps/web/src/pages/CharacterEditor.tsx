import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DATING_STAT_KEYS,
  DEFAULT_DATING_STATS,
  GUARDEDNESS_DEFAULT,
  guardednessDescriptor,
  MIN_CHARACTER_AGE,
  RELATIONSHIP_STYLE_LABELS,
  CHARACTER_LINK_LABELS,
  GENDER_LABELS,
  SEXUALITY_LABELS,
  EXPRESSIONS,
  EXPRESSION_LABELS,
  DAYS_OF_WEEK,
  WEATHER_KINDS,
  WEATHER_ICONS,
  type Character,
  type CharacterLink,
  type CharacterLinkKind,
  type Employment,
  type CharacterMemory,
  type DatingStats,
  type Expression,
  type Gender,
  type Relationship,
  type RelationshipStyle,
  type Sexuality,
  type World,
} from '@dsim/shared';
import { api } from '../lib/api';
import { errorMessage } from '../lib/hooks';
import { useAppData } from '../state/app-context';
import { useT } from '../i18n';
import type { MessageKey } from '../i18n/locales/en';
import {
  genderLabel,
  sexualityLabel,
  relStyleLabel,
  linkLabel,
  datingStatLabel,
  weatherLabel as weatherLabelTr,
  dayLabel,
} from '../i18n/sharedLabels';
import { Banner, ConfirmDialog, Field, TagInput } from '../components/ui';
import { AssetPicker } from '../components/AssetPicker';
import { RelationshipBars } from '../components/StatBars';
import { Portrait } from '../components/Portrait';
import { Icon } from '../components/Icon';
import './creator.page.css';

// ---------------------------------------------------------------------------
// Form type
// ---------------------------------------------------------------------------

interface Form {
  name: string;
  age: number;
  pronouns: string;
  gender: Gender;
  sexuality: Sexuality;
  worldId: string | null;
  shortDescription: string;
  personality: string;
  speechStyle: string;
  creatorNotes: string;
  relationshipPreferences: string;
  relationshipStyle: RelationshipStyle;
  guardedness: number;
  likes: string[];
  dislikes: string[];
  boundaries: string[];
  goals: string[];
  links: CharacterLink[];
  employment: Employment | null;
  allowsExCanonization: boolean;
  favoriteWeather: string[];
  dislikedWeather: string[];
  datingStats: DatingStats;
  appearance: string;
  textingStyle: string;
  onlinePersona: string;
  loveLanguage: string;
  physicalNeeds: string[];
  physicalDesires: string[];
  physicalDislikes: string[];
  insecurities: string[];
  quirks: string[];
  portraitAssetId: string | null;
  expressionRows: Array<{ name: string; assetId: string | null }>;
}

const emptyForm: Form = {
  name: '',
  age: MIN_CHARACTER_AGE,
  pronouns: 'they/them',
  gender: 'unspecified',
  sexuality: 'unspecified',
  worldId: null,
  shortDescription: '',
  personality: '',
  speechStyle: '',
  creatorNotes: '',
  relationshipPreferences: '',
  relationshipStyle: 'monogamous',
  guardedness: GUARDEDNESS_DEFAULT,
  likes: [],
  dislikes: [],
  boundaries: [],
  goals: [],
  links: [],
  employment: null,
  allowsExCanonization: false,
  favoriteWeather: [],
  dislikedWeather: [],
  datingStats: { ...DEFAULT_DATING_STATS },
  appearance: '',
  textingStyle: '',
  onlinePersona: '',
  loveLanguage: '',
  physicalNeeds: [],
  physicalDesires: [],
  physicalDislikes: [],
  insecurities: [],
  quirks: [],
  portraitAssetId: null,
  expressionRows: EXPRESSIONS.map((name) => ({ name, assetId: null })),
};

// ---------------------------------------------------------------------------
// Tab definitions — sections are grouped into 5 logical steps
// ---------------------------------------------------------------------------

type TabId = 'identity' | 'personality' | 'profile' | 'relationships' | 'world';

const TABS: { id: TabId; labelKey: MessageKey }[] = [
  { id: 'identity',      labelKey: 'editor.tab.identity' },
  { id: 'personality',   labelKey: 'editor.tab.personality' },
  { id: 'profile',       labelKey: 'editor.tab.profile' },
  { id: 'relationships', labelKey: 'editor.tab.relationships' },
  { id: 'world',         labelKey: 'editor.tab.world' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CharacterEditor() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const t = useT();
  const { reloadAssets, activeWorldId } = useAppData();

  const [form, setForm] = useState<Form>(emptyForm);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [allChars, setAllChars] = useState<Character[]>([]);
  const [memories, setMemories] = useState<CharacterMemory[]>([]);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string>();
  const [preview, setPreview] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [expressionsOpen, setExpressionsOpen] = useState(false);
  const [newMemory, setNewMemory] = useState({ text: '', importance: 3 });
  const [addingMemory, setAddingMemory] = useState(false);
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);
  const [generatingStats, setGeneratingStats] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [generatingFromImage, setGeneratingFromImage] = useState(false);
  const [imageConfirmOpen, setImageConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('identity');

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const DEFAULT_JOB: Employment = { title: '', place: '', workdays: [0, 1, 2, 3, 4], shiftPhase: 'morning' };
  const patchEmp = (patch: Partial<Employment>) =>
    setForm((f) => ({ ...f, employment: { ...(f.employment ?? DEFAULT_JOB), ...patch } }));
  const toggleWorkday = (idx: number) =>
    setForm((f) => {
      const cur = f.employment ?? DEFAULT_JOB;
      const workdays = cur.workdays.includes(idx)
        ? cur.workdays.filter((d) => d !== idx)
        : [...cur.workdays, idx].sort((a, b) => a - b);
      return { ...f, employment: { ...cur, workdays } };
    });

  const toggleWeather = (kind: string, pref: 'fav' | 'dis') =>
    setForm((f) => {
      const inFav = f.favoriteWeather.includes(kind);
      const inDis = f.dislikedWeather.includes(kind);
      const fav = f.favoriteWeather.filter((k) => k !== kind);
      const dis = f.dislikedWeather.filter((k) => k !== kind);
      if (pref === 'fav' && !inFav) fav.push(kind);
      if (pref === 'dis' && !inDis) dis.push(kind);
      return { ...f, favoriteWeather: fav, dislikedWeather: dis };
    });

  useEffect(() => {
    void api.listWorlds().then(setWorlds).catch(() => undefined);
    void api.listCharacters().then(setAllChars).catch(() => undefined);
    void reloadAssets();
    if (!id) {
      // A brand-new character defaults to the world you're playing, so it never
      // gets orphaned (a world-less character shows up in no world's roster).
      setForm({ ...emptyForm, worldId: activeWorldId });
      return;
    }
    void (async () => {
      try {
        const bundle = await api.getCharacterBundle(id);
        const c = bundle.character;
        setForm({
          name: c.name,
          age: c.age,
          pronouns: c.pronouns,
          gender: c.gender,
          sexuality: c.sexuality,
          worldId: c.worldId,
          shortDescription: c.shortDescription,
          personality: c.personality,
          speechStyle: c.speechStyle,
          creatorNotes: c.creatorNotes,
          relationshipPreferences: c.relationshipPreferences,
          relationshipStyle: c.relationshipStyle,
          guardedness: c.guardedness,
          likes: c.likes,
          dislikes: c.dislikes,
          boundaries: c.boundaries,
          goals: c.goals,
          links: c.links,
          employment: c.employment,
          allowsExCanonization: c.allowsExCanonization,
          favoriteWeather: c.favoriteWeather,
          dislikedWeather: c.dislikedWeather,
          datingStats: c.datingStats,
          appearance: c.appearance,
          textingStyle: c.textingStyle,
          onlinePersona: c.onlinePersona,
          loveLanguage: c.loveLanguage,
          physicalNeeds: c.physicalNeeds,
          physicalDesires: c.physicalDesires,
          physicalDislikes: c.physicalDislikes,
          insecurities: c.insecurities,
          quirks: c.quirks,
          portraitAssetId: c.portraitAssetId,
          expressionRows: EXPRESSIONS.map((name) => ({ name, assetId: c.expressionAssets[name] ?? null })),
        });
        setMemories(bundle.memories);
        setRelationship(bundle.relationship);
      } catch (e) {
        setError(errorMessage(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadAssets]);

  const payload = useMemo(
    () => ({
      name: form.name,
      age: form.age,
      pronouns: form.pronouns,
      gender: form.gender,
      sexuality: form.sexuality,
      worldId: form.worldId,
      shortDescription: form.shortDescription,
      personality: form.personality,
      speechStyle: form.speechStyle,
      creatorNotes: form.creatorNotes,
      relationshipPreferences: form.relationshipPreferences,
      relationshipStyle: form.relationshipStyle,
      guardedness: form.guardedness,
      likes: form.likes,
      dislikes: form.dislikes,
      boundaries: form.boundaries,
      goals: form.goals,
      links: form.links.filter((l) => l.targetId),
      // A half-filled job (no title/place) is treated as unemployed, like empty links are dropped.
      employment:
        form.employment && form.employment.title.trim() && form.employment.place.trim()
          ? { ...form.employment, title: form.employment.title.trim(), place: form.employment.place.trim() }
          : null,
      allowsExCanonization: form.allowsExCanonization,
      favoriteWeather: form.favoriteWeather,
      dislikedWeather: form.dislikedWeather,
      datingStats: form.datingStats,
      appearance: form.appearance,
      textingStyle: form.textingStyle,
      onlinePersona: form.onlinePersona,
      loveLanguage: form.loveLanguage,
      physicalNeeds: form.physicalNeeds,
      physicalDesires: form.physicalDesires,
      physicalDislikes: form.physicalDislikes,
      insecurities: form.insecurities,
      quirks: form.quirks,
      portraitAssetId: form.portraitAssetId,
      expressionAssets: Object.fromEntries(
        form.expressionRows.filter((r) => r.name.trim() && r.assetId).map((r) => [r.name.trim(), r.assetId as string]),
      ),
    }),
    [form],
  );

  const save = async () => {
    setSaving(true);
    setError(undefined);
    setSavedNote(undefined);
    try {
      if (isNew) {
        const created = await api.createCharacter(payload);
        nav(`/characters/${created.id}/edit`);
      } else {
        await api.updateCharacter(id!, payload);
        setSavedNote(t('editor.savedShort'));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const addMemory = async () => {
    if (!id || !newMemory.text.trim() || addingMemory) return;
    setAddingMemory(true);
    try {
      await api.addMemory(id, { text: newMemory.text.trim(), importance: newMemory.importance, tags: [] });
      setMemories(await api.listMemories(id));
      setNewMemory({ text: '', importance: 3 });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setAddingMemory(false);
    }
  };

  const generateStats = async () => {
    setGeneratingStats(true);
    setError(undefined);
    try {
      const res = await api.generateStats({
        name: form.name,
        age: form.age,
        shortDescription: form.shortDescription,
        personality: form.personality,
        speechStyle: form.speechStyle,
        likes: form.likes,
        dislikes: form.dislikes,
        goals: form.goals,
        relationshipPreferences: form.relationshipPreferences,
      });
      if (res.ok) {
        set('datingStats', res.data);
        setSavedNote(t('editor.statsGenerated'));
      } else {
        setError(t('editor.statsFailed', { error: res.error }));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setGeneratingStats(false);
    }
  };

  const generateProfile = async () => {
    setGeneratingProfile(true);
    setError(undefined);
    try {
      const res = await api.generateProfile({
        name: form.name,
        age: form.age,
        shortDescription: form.shortDescription,
        personality: form.personality,
        speechStyle: form.speechStyle,
        likes: form.likes,
        dislikes: form.dislikes,
        goals: form.goals,
        relationshipPreferences: form.relationshipPreferences,
        appearance: form.appearance,
      });
      if (res.ok) {
        setForm((f) => ({
          ...f,
          appearance: res.data.appearance,
          textingStyle: res.data.textingStyle,
          onlinePersona: res.data.onlinePersona,
          loveLanguage: res.data.loveLanguage,
          physicalNeeds: res.data.physicalNeeds,
          physicalDesires: res.data.physicalDesires,
          physicalDislikes: res.data.physicalDislikes,
          insecurities: res.data.insecurities,
          quirks: res.data.quirks,
        }));
        setSavedNote(t('editor.profileGenerated'));
      } else {
        setError(t('editor.profileFailed', { error: res.error }));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setGeneratingProfile(false);
    }
  };

  // True when the draft already has enough content that regenerating from a photo
  // would clobber real work — used to gate the overwrite confirmation.
  const hasContent = Boolean(
    form.name.trim() || form.shortDescription.trim() || form.personality.trim() || form.appearance.trim(),
  );

  const runImageGeneration = async () => {
    if (!form.portraitAssetId) return;
    setGeneratingFromImage(true);
    setError(undefined);
    setSavedNote(undefined);
    try {
      const res = await api.generateCharacterFromImage({
        assetId: form.portraitAssetId,
        worldId: form.worldId,
      });
      if (res.ok) {
        const d = res.data;
        // Fill the generated fields; PRESERVE the chosen portrait, expressions,
        // world, and the creator-only fields the model never sees.
        setForm((f) => ({
          ...f,
          name: d.name,
          age: d.age,
          pronouns: d.pronouns,
          gender: d.gender,
          sexuality: d.sexuality,
          shortDescription: d.shortDescription,
          personality: d.personality,
          speechStyle: d.speechStyle,
          relationshipPreferences: d.relationshipPreferences,
          relationshipStyle: d.relationshipStyle,
          guardedness: d.guardedness,
          likes: d.likes,
          dislikes: d.dislikes,
          goals: d.goals,
          boundaries: d.boundaries,
          appearance: d.appearance,
          textingStyle: d.textingStyle,
          onlinePersona: d.onlinePersona,
          loveLanguage: d.loveLanguage,
          physicalNeeds: d.physicalNeeds,
          physicalDesires: d.physicalDesires,
          physicalDislikes: d.physicalDislikes,
          insecurities: d.insecurities,
          quirks: d.quirks,
          datingStats: d.datingStats,
        }));
        setActiveTab('identity');
        setSavedNote(t('editor.imageGenerated'));
      } else {
        setError(t('editor.imageFailed', { error: res.error }));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setGeneratingFromImage(false);
    }
  };

  // Confirm before overwriting an already-filled draft; otherwise generate now.
  const generateFromImage = () => {
    if (!form.portraitAssetId) return;
    if (hasContent) setImageConfirmOpen(true);
    else void runImageGeneration();
  };

  const showPreview = async () => {
    if (!id) return;
    try {
      const p = await api.promptPreview(id);
      setPreview(`${t('editor.preview.chars', { n: p.approxChars })}\n\n${p.system}`);
      setPreviewOpen(true);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  // Synthetic character object fed to <Portrait> — mirrors the API shape without
  // needing an actual saved character record.
  const previewCharacter = useMemo(
    () => ({
      name: form.name || t('editor.unnamed'),
      portraitAssetId: form.portraitAssetId,
      expressionAssets: Object.fromEntries(
        form.expressionRows.filter((r) => r.name.trim() && r.assetId).map((r) => [r.name.trim(), r.assetId as string]),
      ),
    }),
    [form.name, form.portraitAssetId, form.expressionRows, t],
  );

  return (
    <div className="ce-layout">
      {/* ------------------------------------------------------------------ */}
      {/* Masthead                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="framed creator-head ce-head">
        <div className="creator-head-titles">
          <div className="creator-meta">
            <span className="kicker">{t('editor.head.kicker')}</span>
            <span className="creator-tool-tag">{isNew ? t('editor.tag.new') : t('editor.tag.editing')}</span>
          </div>
          <h1>{isNew ? t('editor.head.titleNew') : t('editor.head.titleEdit', { name: form.name || t('editor.head.charFallback') })}</h1>
          <p>{t('editor.head.lede')}</p>
        </div>
        <div className="creator-head-actions">
          {!isNew && (
            <button className="btn ghost" onClick={showPreview}>
              <Icon name="preview" size={14} />
              {t('editor.previewPrompt')}
            </button>
          )}
          <button className="btn primary" onClick={save} disabled={saving || !form.name.trim()}>
            <Icon name="save" size={14} />
            {saving ? t('common.saving') : isNew ? t('editor.create') : t('editor.save')}
          </button>
        </div>
      </div>

      {error && <Banner kind="error">{error}</Banner>}
      {savedNote && <Banner kind="ok">{savedNote}</Banner>}

      {/* ------------------------------------------------------------------ */}
      {/* Two-column canvas: side rail (portrait preview) + main form         */}
      {/* ------------------------------------------------------------------ */}
      <div className="ce-canvas">

        {/* Sticky portrait rail */}
        <aside className="ce-rail">
          <div className="ce-portrait-plate framed">
            <Portrait character={previewCharacter} className="ce-portrait-img" />
            <div className="ce-portrait-name">{form.name || <span className="ce-portrait-placeholder">{t('editor.unnamed')}</span>}</div>
            {form.age >= MIN_CHARACTER_AGE && (
              <div className="ce-portrait-meta">{form.age} · {form.pronouns || '—'}</div>
            )}
            {relationship && (
              <div className="ce-portrait-bars">
                <RelationshipBars relationship={relationship} />
              </div>
            )}
          </div>
        </aside>

        {/* Form column */}
        <div className="ce-main stack">

          {/* Tab nav */}
          <nav className="ce-tabs" aria-label={t('editor.tabsAria')}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`ce-tab ${activeTab === tab.id ? 'ce-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </nav>

          {/* ------------------------------------------------------------ */}
          {/* Tab: Identity — sections 01 Portrait + 02 Identity basics     */}
          {/* ------------------------------------------------------------ */}
          <div className={`ce-panel stack ${activeTab === 'identity' ? '' : 'ce-panel-hidden'}`}>
            <div className="grid cols-2">
              <div className="card">
                <div className="creator-sec">
                  <span className="creator-index">01</span>
                  <h2>{t('editor.sec.identity')}</h2>
                  <span className="trail" />
                </div>
                <Field label={t('editor.field.name')}>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </Field>
                <div className="inline-fields">
                  <Field label={t('editor.field.age')} hint={t('editor.field.ageHint', { min: MIN_CHARACTER_AGE })}>
                    <input
                      type="number"
                      min={MIN_CHARACTER_AGE}
                      value={form.age}
                      onChange={(e) => set('age', Number(e.target.value))}
                    />
                  </Field>
                  <Field label={t('editor.field.pronouns')}>
                    <input value={form.pronouns} onChange={(e) => set('pronouns', e.target.value)} />
                  </Field>
                </div>
                <div className="inline-fields">
                  <Field label={t('editor.field.gender')} hint={t('editor.field.genderHint')}>
                    <select value={form.gender} onChange={(e) => set('gender', e.target.value as Gender)}>
                      {Object.keys(GENDER_LABELS).map((k) => (
                        <option key={k} value={k}>
                          {genderLabel(t, k)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t('editor.field.sexuality')} hint={t('editor.field.sexualityHint')}>
                    <select value={form.sexuality} onChange={(e) => set('sexuality', e.target.value as Sexuality)}>
                      {Object.keys(SEXUALITY_LABELS).map((k) => (
                        <option key={k} value={k}>
                          {sexualityLabel(t, k)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label={t('editor.field.world')} hint={t('editor.field.worldHint')}>
                  <select value={form.worldId ?? ''} onChange={(e) => set('worldId', e.target.value || null)}>
                    <option value="">{t('editor.world.none')}</option>
                    {worlds.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('editor.field.relStyle')} hint={t('editor.field.relStyleHint')}>
                  <select
                    value={form.relationshipStyle}
                    onChange={(e) => set('relationshipStyle', e.target.value as RelationshipStyle)}
                  >
                    {(Object.keys(RELATIONSHIP_STYLE_LABELS) as RelationshipStyle[]).map((k) => (
                      <option key={k} value={k}>
                        {relStyleLabel(t, k)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('editor.field.shortDesc')}>
                  <textarea value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
                </Field>
              </div>

              <div className="card">
                <div className="creator-sec">
                  <span className="creator-index">02</span>
                  <h2>{t('editor.sec.portrait')}</h2>
                  <span className="trail" />
                </div>
                <AssetPicker value={form.portraitAssetId} onChange={(v) => set('portraitAssetId', v)} />
                <div className="ce-image-gen">
                  <button
                    className="btn sm primary"
                    onClick={generateFromImage}
                    disabled={generatingFromImage || !form.portraitAssetId}
                  >
                    <Icon name="generate" size={13} />
                    {generatingFromImage ? t('editor.image.reading') : t('editor.image.generate')}
                  </button>
                  <p className="creator-note">
                    {form.portraitAssetId ? t('editor.image.noteHas') : t('editor.image.noteEmpty')}
                  </p>
                </div>
                <div className="divider" />
                <div
                  className="creator-sec"
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expressionsOpen}
                  onClick={() => setExpressionsOpen((o) => !o)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpressionsOpen((o) => !o);
                    }
                  }}
                >
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name={expressionsOpen ? 'chevronDown' : 'chevronRight'} size={16} />
                    {t('editor.expr.title')}
                    <span className="badge" style={{ marginLeft: 6 }}>
                      {t('editor.expr.set', { n: form.expressionRows.filter((r) => r.assetId).length })}
                    </span>
                  </h3>
                  <span className="trail" />
                </div>
                {expressionsOpen && (
                  <>
                    <p className="creator-note">{t('editor.expr.note')}</p>
                    {form.expressionRows.map((row, i) => (
                  <div key={row.name} className="creator-subcard stack">
                    <div className="row">
                      <strong className="flex-fill">{EXPRESSION_LABELS[row.name as Expression] ?? row.name}</strong>
                      {row.assetId && (
                        <button
                          className="btn sm danger"
                          onClick={() => {
                            const rows = [...form.expressionRows];
                            rows[i] = { ...rows[i]!, assetId: null };
                            set('expressionRows', rows);
                          }}
                        >
                          <Icon name="trash" size={13} />
                          {t('editor.clear')}
                        </button>
                      )}
                    </div>
                    <AssetPicker
                      value={row.assetId}
                      uploadType="expression"
                      onChange={(v) => {
                        const rows = [...form.expressionRows];
                        rows[i] = { ...rows[i]!, assetId: v };
                        set('expressionRows', rows);
                      }}
                    />
                  </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Tab: Personality — sections 03 + 04                           */}
          {/* ------------------------------------------------------------ */}
          <div className={`ce-panel stack ${activeTab === 'personality' ? '' : 'ce-panel-hidden'}`}>
            <div className="grid cols-2">
              <div className="card">
                <div className="creator-sec">
                  <span className="creator-index">03</span>
                  <h2>{t('editor.sec.personality')}</h2>
                  <span className="trail" />
                </div>
                <Field label={t('editor.field.personality')}>
                  <textarea value={form.personality} onChange={(e) => set('personality', e.target.value)} />
                </Field>
                <Field label={t('editor.field.speechStyle')}>
                  <textarea value={form.speechStyle} onChange={(e) => set('speechStyle', e.target.value)} />
                </Field>
                <Field label={t('editor.field.relPrefs')}>
                  <textarea
                    value={form.relationshipPreferences}
                    onChange={(e) => set('relationshipPreferences', e.target.value)}
                  />
                </Field>
                <Field label={t('editor.field.creatorNotes')} hint={t('editor.field.creatorNotesHint')}>
                  <textarea value={form.creatorNotes} onChange={(e) => set('creatorNotes', e.target.value)} />
                </Field>
              </div>

              <div className="card">
                <div className="creator-sec">
                  <span className="creator-index">04</span>
                  <h2>{t('editor.sec.traits')}</h2>
                  <span className="trail" />
                </div>
                <Field label={t('editor.field.likes')}>
                  <TagInput value={form.likes} onChange={(v) => set('likes', v)} />
                </Field>
                <Field label={t('editor.field.dislikes')}>
                  <TagInput value={form.dislikes} onChange={(v) => set('dislikes', v)} />
                </Field>
                <Field label={t('editor.field.goals')}>
                  <TagInput value={form.goals} onChange={(v) => set('goals', v)} />
                </Field>
                <Field label={t('editor.field.boundaries')}>
                  <TagInput value={form.boundaries} onChange={(v) => set('boundaries', v)} />
                </Field>
                <Field
                  label={t('editor.field.guardedness', { value: form.guardedness, descriptor: guardednessDescriptor(form.guardedness) })}
                  hint={t('editor.field.guardednessHint')}
                >
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.guardedness}
                    onChange={(e) => set('guardedness', Number(e.target.value))}
                  />
                  <div className="ce-range-ends">
                    <span>{t('editor.guard.openBook')}</span>
                    <span>{t('editor.guard.walledOff')}</span>
                  </div>
                </Field>
              </div>
            </div>

            {/* Weather preferences — fits naturally under personality */}
            <div className="card">
              <div className="creator-sec">
                <span className="creator-index">09</span>
                <h2>{t('editor.sec.weather')}</h2>
                <span className="trail" />
              </div>
              <p className="creator-note">{t('editor.weather.note')}</p>
              <div className="weather-pref-grid">
                {WEATHER_KINDS.map((k) => {
                  const fav = form.favoriteWeather.includes(k);
                  const dis = form.dislikedWeather.includes(k);
                  return (
                    <div className="weather-pref" key={k}>
                      <span className="flex-fill">
                        {WEATHER_ICONS[k]} {weatherLabelTr(t, k)}
                      </span>
                      <button
                        className={`btn sm ${fav ? 'primary' : 'ghost'}`}
                        onClick={() => toggleWeather(k, 'fav')}
                        title={t('editor.weather.lovesTitle')}
                      >
                        ♥
                      </button>
                      <button
                        className={`btn sm ${dis ? 'danger' : 'ghost'}`}
                        onClick={() => toggleWeather(k, 'dis')}
                        title={t('editor.weather.dislikesTitle')}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Tab: Profile — sections 05 + 06                               */}
          {/* ------------------------------------------------------------ */}
          <div className={`ce-panel stack ${activeTab === 'profile' ? '' : 'ce-panel-hidden'}`}>
            <div className="grid cols-2">
              <div className="card">
                <div className="creator-sec">
                  <span className="creator-index">05</span>
                  <h2>{t('editor.sec.profile')}</h2>
                  <span className="trail" />
                  <button
                    className="btn sm creator-sec-action"
                    onClick={generateProfile}
                    disabled={generatingProfile || !form.name.trim()}
                  >
                    <Icon name="generate" size={13} />
                    {generatingProfile ? t('editor.generating') : t('editor.generateFromDesc')}
                  </button>
                </div>
                <p className="creator-note">
                  {t('editor.profile.note', { name: form.name || t('editor.thisCharacter') })}
                </p>
                <Field label={t('editor.field.appearance')}>
                  <textarea value={form.appearance} onChange={(e) => set('appearance', e.target.value)} />
                </Field>
                <Field label={t('editor.field.textingStyle')} hint={t('editor.field.textingStyleHint')}>
                  <textarea value={form.textingStyle} onChange={(e) => set('textingStyle', e.target.value)} />
                </Field>
                <Field label={t('editor.field.onlinePersona')} hint={t('editor.field.onlinePersonaHint')}>
                  <textarea value={form.onlinePersona} onChange={(e) => set('onlinePersona', e.target.value)} />
                </Field>
                <Field label={t('editor.field.loveLanguage')}>
                  <input value={form.loveLanguage} onChange={(e) => set('loveLanguage', e.target.value)} />
                </Field>
              </div>

              <div className="card">
                <div className="creator-sec">
                  <span className="creator-index">06</span>
                  <h2>{t('editor.sec.chemistry')}</h2>
                  <span className="trail" />
                </div>
                <p className="creator-note">{t('editor.chem.note')}</p>
                <Field label={t('editor.field.physicalNeeds')}>
                  <TagInput value={form.physicalNeeds} onChange={(v) => set('physicalNeeds', v)} />
                </Field>
                <Field label={t('editor.field.physicalDesires')}>
                  <TagInput value={form.physicalDesires} onChange={(v) => set('physicalDesires', v)} />
                </Field>
                <Field label={t('editor.field.physicalDislikes')}>
                  <TagInput value={form.physicalDislikes} onChange={(v) => set('physicalDislikes', v)} />
                </Field>
                <Field label={t('editor.field.insecurities')}>
                  <TagInput value={form.insecurities} onChange={(v) => set('insecurities', v)} />
                </Field>
                <Field label={t('editor.field.quirks')}>
                  <TagInput value={form.quirks} onChange={(v) => set('quirks', v)} />
                </Field>
              </div>
            </div>

            {/* Dating stats also belong in Profile — defines their dating persona */}
            <div className="card">
              <div className="creator-sec">
                <span className="creator-index">10</span>
                <h2>{t('editor.sec.datingStats')}</h2>
                <span className="trail" />
                <button
                  className="btn sm creator-sec-action"
                  onClick={generateStats}
                  disabled={generatingStats || !form.name.trim()}
                >
                  <Icon name="generate" size={13} />
                  {generatingStats ? t('editor.generating') : t('editor.generateFromDesc')}
                </button>
              </div>
              {DATING_STAT_KEYS.map((k) => (
                <Field key={k} label={t('editor.statLine', { label: datingStatLabel(t, k), value: form.datingStats[k] })}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.datingStats[k]}
                    onChange={(e) => set('datingStats', { ...form.datingStats, [k]: Number(e.target.value) })}
                  />
                </Field>
              ))}
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Tab: Relationships — sections 07 + 11 + 12                    */}
          {/* ------------------------------------------------------------ */}
          <div className={`ce-panel stack ${activeTab === 'relationships' ? '' : 'ce-panel-hidden'}`}>
            <div className="card">
              <div className="creator-sec">
                <span className="creator-index">07</span>
                <h2>{t('editor.sec.connections')}</h2>
                <span className="trail" />
              </div>
              <p className="creator-note">{t('editor.conn.note', { name: form.name || t('editor.thisCharacter') })}</p>
              {form.links.map((link, i) => (
                <div className="ce-link-row" key={i}>
                  <select
                    className="flex-fill"
                    value={link.targetId}
                    onChange={(e) => {
                      const links = [...form.links];
                      links[i] = { ...links[i]!, targetId: e.target.value };
                      set('links', links);
                    }}
                  >
                    <option value="">{t('editor.conn.charPlaceholder')}</option>
                    {allChars
                      // Only this character's OWN world — connections never cross worlds.
                      .filter((c) => c.id !== id && c.worldId === form.worldId)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <select
                    value={link.kind}
                    onChange={(e) => {
                      const links = [...form.links];
                      links[i] = { ...links[i]!, kind: e.target.value as CharacterLinkKind };
                      set('links', links);
                    }}
                  >
                    {(Object.keys(CHARACTER_LINK_LABELS) as CharacterLinkKind[]).map((k) => (
                      <option key={k} value={k}>
                        {linkLabel(t, k)}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn sm danger"
                    onClick={() => set('links', form.links.filter((_, j) => j !== i))}
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}
              <button
                className="btn sm"
                onClick={() => set('links', [...form.links, { targetId: '', kind: 'friend' }])}
              >
                <Icon name="plus" size={13} />
                {t('editor.conn.add')}
              </button>
              <label className="ce-excanoize-label">
                <input
                  type="checkbox"
                  checked={form.allowsExCanonization}
                  onChange={(e) => set('allowsExCanonization', e.target.checked)}
                />
                <span className="creator-note ce-excanoize-body">
                  <strong>{t('editor.excanon.strong')}</strong>
                  {t('editor.excanon.body', { name: form.name || t('editor.thisCharacter') })}
                </span>
              </label>
            </div>

            {/* Relationship stats */}
            <div className="card">
              <div className="creator-sec">
                <span className="creator-index">11</span>
                <h2>{t('editor.sec.relationship')}</h2>
                <span className="trail" />
              </div>
              {relationship ? (
                <RelationshipBars relationship={relationship} />
              ) : (
                <p className="muted">{t('editor.rel.afterCreate')}</p>
              )}
            </div>

            {/* Memories */}
            <div className="card">
              <div className="creator-sec">
                <span className="creator-index">12</span>
                <h2>{t('editor.sec.memories')}</h2>
                <span className="trail" />
              </div>
              {isNew ? (
                <p className="muted">{t('editor.mem.saveFirst')}</p>
              ) : (
                <>
                  <div className="row" style={{ alignItems: 'flex-end' }}>
                    <div className="flex-fill">
                      <Field label={t('editor.mem.add')}>
                        <input
                          value={newMemory.text}
                          placeholder={t('editor.mem.placeholder')}
                          onChange={(e) => setNewMemory((m) => ({ ...m, text: e.target.value }))}
                        />
                      </Field>
                    </div>
                    <Field label={t('editor.mem.importance')}>
                      <select
                        value={newMemory.importance}
                        onChange={(e) => setNewMemory((m) => ({ ...m, importance: Number(e.target.value) }))}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <button className="btn" onClick={addMemory} disabled={addingMemory || !newMemory.text.trim()}>
                      {addingMemory ? t('editor.mem.adding') : t('editor.mem.addBtn')}
                    </button>
                  </div>
                  {memories.length === 0 ? (
                    <p className="muted">{t('editor.mem.none')}</p>
                  ) : (
                    memories.map((m) => (
                      <div className="list-item" key={m.id}>
                        <span className="badge accent">{m.importance}</span>
                        <span className="flex-fill">{m.text}</span>
                        <button
                          className="btn sm danger"
                          disabled={deletingMemoryId !== null}
                          onClick={async () => {
                            if (deletingMemoryId) return;
                            setDeletingMemoryId(m.id);
                            try {
                              await api.deleteMemory(m.id);
                              if (id) setMemories(await api.listMemories(id));
                            } catch (e) {
                              setError(errorMessage(e));
                            } finally {
                              setDeletingMemoryId(null);
                            }
                          }}
                        >
                          {deletingMemoryId === m.id ? t('editor.mem.deleting') : t('common.delete')}
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Tab: World — sections 08 Employment                           */}
          {/* ------------------------------------------------------------ */}
          <div className={`ce-panel stack ${activeTab === 'world' ? '' : 'ce-panel-hidden'}`}>
            <div className="card">
              <div className="creator-sec">
                <span className="creator-index">08</span>
                <h2>{t('editor.sec.employment')}</h2>
                <span className="trail" />
              </div>
              <p className="creator-note">{t('editor.emp.note', { name: form.name || t('editor.thisCharacter') })}</p>
              <label className="ce-employed-toggle">
                <input
                  type="checkbox"
                  checked={form.employment != null}
                  onChange={(e) => set('employment', e.target.checked ? { ...DEFAULT_JOB } : null)}
                />
                <span>{t('editor.emp.employed')}</span>
              </label>
              {form.employment && (
                <>
                  <div className="inline-fields">
                    <Field label={t('editor.emp.jobTitle')}>
                      <input value={form.employment.title} onChange={(e) => patchEmp({ title: e.target.value })} />
                    </Field>
                    <Field label={t('editor.emp.workplace')} hint={t('editor.emp.workplaceHint')}>
                      <input value={form.employment.place} onChange={(e) => patchEmp({ place: e.target.value })} />
                    </Field>
                  </div>
                  <Field label={t('editor.emp.shift')}>
                    <select
                      value={form.employment.shiftPhase}
                      onChange={(e) => patchEmp({ shiftPhase: e.target.value as Employment['shiftPhase'] })}
                    >
                      <option value="morning">{t('editor.emp.shiftMorning')}</option>
                      <option value="afternoon">{t('editor.emp.shiftAfternoon')}</option>
                      <option value="evening">{t('editor.emp.shiftEvening')}</option>
                    </select>
                  </Field>
                  <Field label={t('editor.emp.workdays')}>
                    <div className="ce-workdays">
                      {DAYS_OF_WEEK.map((d, idx) => (
                        <button
                          key={d}
                          type="button"
                          className={`btn sm ${form.employment!.workdays.includes(idx) ? 'primary' : 'ghost'}`}
                          onClick={() => toggleWorkday(idx)}
                          title={dayLabel(t, d)}
                        >
                          {dayLabel(t, d).slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Prompt preview — collapsible dev panel, not always visible          */}
      {/* ------------------------------------------------------------------ */}
      {previewOpen && preview !== undefined && (
        <details className="card ce-prompt-details" open>
          <summary className="ce-prompt-summary">
            <div className="creator-sec" style={{ margin: 0, flex: 1 }}>
              <span className="kicker">{t('editor.preview.kicker')}</span>
              <span className="trail" />
              <button
                className="btn sm ghost creator-sec-action"
                onClick={() => setPreviewOpen(false)}
              >
                <Icon name="close" size={13} />
                {t('common.close')}
              </button>
            </div>
          </summary>
          <pre className="pre ce-prompt-pre">{preview}</pre>
        </details>
      )}

      {imageConfirmOpen && (
        <ConfirmDialog
          title={t('editor.imageConfirm.title')}
          kicker={t('editor.imageConfirm.kicker')}
          confirmLabel={generatingFromImage ? t('editor.generating') : t('editor.imageConfirm.overwrite')}
          danger
          busy={generatingFromImage}
          body={t('editor.imageConfirm.body')}
          onCancel={() => setImageConfirmOpen(false)}
          onConfirm={async () => {
            await runImageGeneration();
            setImageConfirmOpen(false);
          }}
        />
      )}
    </div>
  );
}
