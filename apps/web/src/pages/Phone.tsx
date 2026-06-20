import { useEffect, useState } from 'react';
import { PHASE_ICONS } from '@dsim/shared';
import { phaseLabel } from '../i18n/sharedLabels';
import { api } from '../lib/api';
import './phone.page.css';
import { useAppData } from '../state/app-context';
import { useT } from '../i18n';
import type { MessageKey } from '../i18n/locales/en';
import { Icon } from '../components/Icon';
import { MessagesApp } from '../components/phone/MessagesApp';
import { FacesApp } from '../components/phone/FacesApp';
import { EmailApp } from '../components/phone/EmailApp';
import { WorkApp } from '../components/phone/WorkApp';
import { SettingsApp } from '../components/phone/SettingsApp';
import { MomentsApp } from '../components/phone/MomentsApp';
import { SocialApp } from '../components/phone/SocialApp';
import { WeatherApp } from '../components/phone/WeatherApp';
import { CalendarApp } from '../components/phone/CalendarApp';
import { EndingsApp } from '../components/phone/EndingsApp';
import { PropertyApp } from '../components/phone/PropertyApp';
import { MarketApp } from '../components/phone/MarketApp';
import { GamblingApp } from '../components/phone/GamblingApp';
import { Shop } from './Shop';
import { Minigames } from './Minigames';
import { Inventory } from './Inventory';

type AppId = 'home' | 'messages' | 'email' | 'faces' | 'moments' | 'social' | 'weather' | 'calendar' | 'endings' | 'work' | 'property' | 'market' | 'gambling' | 'shop' | 'games' | 'bag' | 'settings';

type Tint = 'rose' | 'brass' | 'moon' | 'sage';

type AppDef = { id: Exclude<AppId, 'home'>; icon: string; labelKey: MessageKey; tint: Tint };

const APPS: AppDef[] = [
  { id: 'messages', icon: 'messages', labelKey: 'phone.app.messages', tint: 'rose' },
  { id: 'email', icon: 'mail', labelKey: 'phone.app.mail', tint: 'moon' },
  { id: 'faces', icon: 'faces', labelKey: 'phone.app.faces', tint: 'moon' },
  { id: 'moments', icon: 'moments', labelKey: 'phone.app.moments', tint: 'rose' },
  { id: 'calendar', icon: 'calendar', labelKey: 'phone.app.calendar', tint: 'brass' },
  { id: 'social', icon: 'social', labelKey: 'phone.app.social', tint: 'moon' },
  { id: 'weather', icon: 'weather', labelKey: 'phone.app.weather', tint: 'moon' },
  { id: 'endings', icon: 'endings', labelKey: 'phone.app.endings', tint: 'brass' },
  { id: 'work', icon: 'work', labelKey: 'phone.app.work', tint: 'brass' },
  { id: 'property', icon: 'property', labelKey: 'phone.app.property', tint: 'brass' },
  { id: 'market', icon: 'stocks', labelKey: 'phone.app.market', tint: 'sage' },
  { id: 'gambling', icon: 'gambling', labelKey: 'phone.app.gambling', tint: 'rose' },
  { id: 'shop', icon: 'shop', labelKey: 'phone.app.shop', tint: 'brass' },
  { id: 'games', icon: 'games', labelKey: 'phone.app.games', tint: 'sage' },
  { id: 'bag', icon: 'bag', labelKey: 'phone.app.bag', tint: 'sage' },
];

// Pinned to the dock, in order; the rest fill the home grid.
const DOCK_IDS: Array<AppDef['id']> = ['messages', 'email', 'moments', 'settings'];

const SETTINGS_APP: AppDef = { id: 'settings', icon: 'settings', labelKey: 'phone.app.settings', tint: 'sage' };
const ALL_APPS: AppDef[] = [...APPS, SETTINGS_APP];

/** Derive a plausible battery % from the world's daily stamina consumption.
 *  Full stamina = high battery; spent stamina = draining battery.
 *  Falls back to a stable mid-value when no world state is available. */
function deriveBattery(stamina: number | undefined, staminaMax: number | undefined): number {
  if (stamina == null || staminaMax == null || staminaMax === 0) return 72;
  // Map stamina remaining onto 20–95 so the battery is never "dead" mid-day.
  return Math.round(20 + (stamina / staminaMax) * 75);
}

export function Phone() {
  const t = useT();
  const { worldState, activeWorldId, activeWorld, dayTick, theme } = useAppData();
  const [app, setApp] = useState<AppId>('home');
  const [inbox, setInbox] = useState({ unreadTexts: 0, unreadEmails: 0, feedUnread: 0, landlordUnread: 0 });

  useEffect(() => {
    api.phoneInbox(activeWorldId ?? undefined).then(setInbox).catch(() => undefined);
  }, [app, activeWorldId, dayTick]);

  // If the active world disables the wealth app you're currently in, bounce home.
  useEffect(() => {
    if (app === 'property' && !activeWorld?.featureFlags?.property) setApp('home');
    if (app === 'market' && !activeWorld?.featureFlags?.stockMarket) setApp('home');
    if (app === 'gambling' && !activeWorld?.featureFlags?.gambling) setApp('home');
  }, [app, activeWorld]);

  const badgeFor = (id: AppId) =>
    id === 'messages'
      ? inbox.unreadTexts + inbox.landlordUnread
      : id === 'email'
        ? inbox.unreadEmails
        : id === 'faces'
          ? inbox.feedUnread
          : 0;

  const renderAppIcon = (a: AppDef) => {
    const count = badgeFor(a.id);
    return (
      <button key={a.id} className={`ph-app is-${a.tint}`} onClick={() => setApp(a.id)} title={t(a.labelKey)}>
        <span className="ph-app-icon">
          <span className="ph-app-tile">
            <span className="ph-app-glyph">
              <Icon name={a.icon as Parameters<typeof Icon>[0]['name']} size={26} />
            </span>
          </span>
          {count > 0 && <span className="ph-badge">{count}</span>}
        </span>
        <span className="ph-app-label">{t(a.labelKey)}</span>
      </button>
    );
  };

  // Per-world feature toggles: hide the wealth apps a world has disabled.
  const featureOk = (id: AppDef['id']): boolean => {
    if (id === 'property') return !!activeWorld?.featureFlags?.property;
    if (id === 'market') return !!activeWorld?.featureFlags?.stockMarket;
    if (id === 'gambling') return !!activeWorld?.featureFlags?.gambling;
    return true;
  };
  const gridApps = ALL_APPS.filter((a) => !DOCK_IDS.includes(a.id) && featureOk(a.id));
  const dockApps = DOCK_IDS.map((id) => ALL_APPS.find((a) => a.id === id)!).filter(Boolean);

  const phaseText = worldState ? phaseLabel(t, worldState.phase) : t('phone.phaseFallback');
  const phaseIcon = worldState ? PHASE_ICONS[worldState.phase] : '🌙';
  const batteryPct = deriveBattery(worldState?.stamina, worldState?.staminaMax);

  return (
    <div className="phone-wrap">
      <div className="phone-device">
        <div className="phone-statusbar">
          <div className="ph-status">
            <div className="ph-status-left">
              <span className="ph-status-time">{phaseIcon} {worldState ? t('dash.hud.day', { day: worldState.day }) : t('phone.status.almanac')}</span>
              <span className="ph-status-phase">{phaseText}</span>
            </div>
            <div className="ph-status-right">
              <span className="ph-signal" aria-hidden="true">
                <i /><i /><i /><i />
              </span>
              <span className="ph-batt" aria-label={t('phone.batteryAria', { pct: batteryPct })}>
                <span className="ph-batt-pct">{batteryPct}</span>
                <span className="ph-batt-body">
                  <span className="ph-batt-fill" style={{ flex: `0 0 ${batteryPct}%` }} />
                </span>
                <span className="ph-batt-cap" />
              </span>
            </div>
          </div>
        </div>
        <div className="phone-screen">
          {app === 'home' ? (
            <>
              <div className={`phone-home${theme.wallpaper ? ' has-wallpaper' : ''}`}>
                <div className="ph-home">
                  <div className="ph-greeting">
                    <div className="ph-greeting-eyebrow">{t('phone.greetingEyebrow', { phase: phaseText })}</div>
                    <h1 className="ph-greeting-title">
                      Pocket <span className="ph-amp">&</span> Lamplight
                    </h1>
                  </div>
                  <div className="ph-grid">
                    {gridApps.map(renderAppIcon)}
                  </div>
                  <div className="ph-hint">{t('phone.hint')}</div>
                </div>
              </div>
              <div className="ph-dock">
                {dockApps.map(renderAppIcon)}
              </div>
            </>
          ) : (
            <div className="phone-appwrap">
              {app === 'messages' && <MessagesApp />}
              {app === 'email' && <EmailApp />}
              {app === 'faces' && <FacesApp />}
              {app === 'moments' && <MomentsApp />}
              {app === 'social' && <SocialApp />}
              {app === 'weather' && <WeatherApp />}
              {app === 'calendar' && <CalendarApp />}
              {app === 'endings' && <EndingsApp />}
              {app === 'work' && <WorkApp />}
              {app === 'property' && <PropertyApp />}
              {app === 'market' && <MarketApp />}
              {app === 'gambling' && <GamblingApp />}
              {app === 'settings' && <SettingsApp />}
              {app === 'shop' && (
                <div className="phone-embed">
                  <Shop />
                </div>
              )}
              {app === 'games' && (
                <div className="phone-embed">
                  <Minigames />
                </div>
              )}
              {app === 'bag' && (
                <div className="phone-embed">
                  <Inventory />
                </div>
              )}
            </div>
          )}
        </div>
        <button className="ph-homebtn" onClick={() => setApp('home')} aria-label={t('nav.home')} title={t('nav.home')} />
      </div>
    </div>
  );
}
