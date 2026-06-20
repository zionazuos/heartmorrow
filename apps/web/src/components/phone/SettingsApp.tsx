import { useRef, useState } from 'react';
import { useAppData } from '../../state/app-context';
import { errorMessage } from '../../lib/hooks';
import { useT } from '../../i18n';
import type { MessageKey } from '../../i18n/locales/en';
import { Icon } from '../Icon';
import { PhoneAppBar } from './PhoneAppBar';
import { Banner, ConfirmDialog } from '../ui';
import '../../pages/settings.page.css';

const PRESETS: Array<{ nameKey: MessageKey; accent: string | null; accent2: string | null }> = [
  { nameKey: 'pset.preset.rose', accent: null, accent2: null },
  { nameKey: 'pset.preset.brass', accent: '#e6b15e', accent2: '#d98a3c' },
  { nameKey: 'pset.preset.moonlight', accent: '#9db8de', accent2: '#6f8fd0' },
  { nameKey: 'pset.preset.sage', accent: '#8fcf9f', accent2: '#4fa97e' },
  { nameKey: 'pset.preset.ember', accent: '#e07a82', accent2: '#b23d52' },
  { nameKey: 'pset.preset.plum', accent: '#b58bd6', accent2: '#e88aa6' },
];

const MAX_WALLPAPER_BYTES = 1.5 * 1024 * 1024;

export function SettingsApp() {
  const t = useT();
  const { theme, setTheme, creatorMode, setCreatorMode, resetProgress } = useAppData();
  const [note, setNote] = useState<string>();
  const [error, setError] = useState<string>();
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onWallpaper = (file: File) => {
    setError(undefined);
    if (file.size > MAX_WALLPAPER_BYTES) {
      setError(t('pset.imageTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setTheme({ ...theme, wallpaper: String(reader.result) });
        setNote(t('pset.wallpaperSet'));
      } catch (e) {
        setError(errorMessage(e));
      }
    };
    reader.readAsDataURL(file);
  };

  const totalReset = async () => {
    setConfirmReset(false);
    setResetting(true);
    setError(undefined);
    try {
      await resetProgress();
      setNote(t('pset.resetDone'));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="phone-app">
      <PhoneAppBar title={t('phone.app.settings')} icon="settings" />
      <div className="phone-embed">
        {note && <Banner kind="ok">{note}</Banner>}
        {error && <Banner kind="error">{error}</Banner>}

        {confirmReset && (
          <ConfirmDialog
            kicker={t('pset.dangerZone')}
            title={t('pset.totalReset')}
            body={t('pset.resetBody')}
            confirmLabel={t('pset.resetConfirm')}
            danger
            busy={resetting}
            onConfirm={() => { void totalReset(); }}
            onCancel={() => setConfirmReset(false)}
          />
        )}

        <div className="pset-list">
          <div className="pset-group">
            <div className="pset-group-head">{t('pset.accent')}</div>
            <div className="pset-panel">
              <div className="pset-swatches">
                {PRESETS.map((p) => {
                  const active = (theme.accent ?? null) === p.accent;
                  return (
                    <button
                      key={p.nameKey}
                      className={`pset-swatch ${active ? 'active' : ''}`}
                      onClick={() => setTheme({ ...theme, accent: p.accent, accent2: p.accent2 })}
                    >
                      <span
                        className="pset-gem"
                        style={{
                          background: p.accent
                            ? `linear-gradient(135deg, ${p.accent}, ${p.accent2})`
                            : 'linear-gradient(135deg, var(--rose), var(--brass))',
                        }}
                      />
                      <span className="pset-swatch-name">{t(p.nameKey)}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pset-custom">
                <span>{t('pset.customTint')}</span>
                {/* <input type="color"> intentionally left as native — the color picker is a platform affordance */}
                <input
                  type="color"
                  value={theme.accent ?? '#e88aa6'}
                  onChange={(e) => setTheme({ ...theme, accent: e.target.value, accent2: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pset-group">
            <div className="pset-group-head">{t('pset.wallpaper')}</div>
            <div className="pset-panel">
              <div className="pset-wall">
                <span
                  className="pset-wall-prev"
                  style={theme.wallpaper ? { backgroundImage: `url("${theme.wallpaper}")` } : undefined}
                >
                  {!theme.wallpaper && <Icon name="download" size={22} />}
                </span>
                <div className="pset-wall-actions">
                  <label className="btn sm">
                    <Icon name="upload" size={14} /> {t('pset.chooseImage')}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onWallpaper(f);
                        if (fileRef.current) fileRef.current.value = '';
                      }}
                    />
                  </label>
                  {theme.wallpaper && (
                    <button className="btn sm ghost" onClick={() => setTheme({ ...theme, wallpaper: null })}>
                      {t('common.remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pset-group">
            <div className="pset-group-head">{t('settings.mode.title')}</div>
            <div className="pset-panel">
              <p className="pset-hint" style={{ marginBottom: 10 }}>{t('pset.modeHint')}</p>
              <div className="row">
                <button className={`btn sm ${!creatorMode ? 'primary' : ''}`} onClick={() => setCreatorMode(false)}>
                  <Icon name="play" size={14} /> {t('settings.mode.playBtn')}
                </button>
                <button className={`btn sm ${creatorMode ? 'primary' : ''}`} onClick={() => setCreatorMode(true)}>
                  <Icon name="settings" size={14} /> {t('settings.mode.creatorBtn')}
                </button>
              </div>
            </div>
          </div>

          <div className="pset-danger">
            <div className="pset-group-head">{t('pset.dangerZone')}</div>
            <p className="pset-hint" style={{ margin: '8px 0 10px' }}>{t('pset.dangerHint')}</p>
            <button className="btn sm danger" onClick={() => setConfirmReset(true)} disabled={resetting}>
              <Icon name="trash" size={14} /> {resetting ? t('pset.resetting') : t('pset.totalResetBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
