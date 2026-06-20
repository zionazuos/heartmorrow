import { useCallback, useEffect, useState } from 'react';
import './phone-comms.css';
import type { Email } from '@dsim/shared';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/hooks';
import { useAppData } from '../../state/app-context';
import { useT, type TFunc } from '../../i18n';
import { Icon } from '../Icon';
import { PhoneAppBar } from './PhoneAppBar';
import { Banner, Spinner } from '../ui';

function senderInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/** Show "Day N" when available; fall back to a short date from the timestamp. */
function emailWhen(e: Email, t: TFunc): string | null {
  if (e.dayNumber != null) return t('dash.hud.day', { day: e.dayNumber });
  const ts = e.deliveredAt ?? e.createdAt;
  if (!ts) return null;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function EmailApp() {
  const t = useT();
  const { activeWorldId, dayTick } = useAppData();
  const [emails, setEmails] = useState<Email[]>([]);
  const [open, setOpen] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setEmails(await api.phoneEmails(activeWorldId ?? undefined));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [activeWorldId, dayTick]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEmail = async (email: Email) => {
    setOpen(email);
    if (!email.read) {
      try {
        await api.phoneReadEmail(email.id);
        setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
      } catch {
        /* ignore */
      }
    }
  };

  if (open) {
    const when = emailWhen(open, t);
    return (
      <div className="phone-app">
        <PhoneAppBar
          title={open.senderName}
          kicker={t('phone.mail.reading')}
          icon="mail"
          left={
            <button className="btn sm ghost pbar-iconbtn" onClick={() => setOpen(null)} aria-label={t('phone.mail.backInbox')} title={t('phone.mail.inbox')}>
              <Icon name="chevronDown" size={18} />
            </button>
          }
        />
        <div className="pcom-reader">
          <h2 className="pcom-reader-subject">{open.subject}</h2>
          <div className="pcom-reader-from">
            <span className="pcom-reader-seal">{senderInitial(open.senderName)}</span>
            <span className="pcom-reader-meta">
              <span className="pcom-reader-sendername">{open.senderName}</span>
              <span className="pcom-reader-handle">{open.senderHandle}</span>
            </span>
            {when && <span className="pcom-when pcom-reader-when">{when}</span>}
          </div>
          <p className="pcom-reader-body">{open.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-app">
      <PhoneAppBar
        title={t('phone.mail.inbox')}
        kicker={t('phone.app.mail')}
        icon="mail"
        right={
          <button className="btn sm ghost pbar-iconbtn" onClick={load} aria-label={t('common.refresh')} title={t('common.refresh')}>
            <Icon name="refresh" size={18} />
          </button>
        }
      />
      {error && <Banner kind="error">{error}</Banner>}
      {loading ? (
        <Spinner />
      ) : emails.length === 0 ? (
        <div className="pcom-empty">
          <span className="pcom-empty-icon"><Icon name="mail" size={32} /></span>
          <span className="pcom-empty-title">{t('phone.mail.emptyTitle')}</span>
          <p>{t('phone.mail.emptyBody')}</p>
        </div>
      ) : (
        <div className="pcom-rows">
          {emails.map((e) => {
            const when = emailWhen(e, t);
            return (
              <button
                key={e.id}
                className={`ph-rise pcom-mail-row ${e.read ? '' : 'pcom-unread'}`}
                onClick={() => openEmail(e)}
              >
                {!e.read && <span className="pcom-mail-dot" />}
                <span className="pcom-mail-top">
                  <span className="pcom-mail-sender">{e.senderName}</span>
                  {when && <span className="pcom-when">{when}</span>}
                </span>
                <span className="pcom-mail-subject">{e.subject}</span>
                <span className="pcom-mail-snippet">{e.body}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
