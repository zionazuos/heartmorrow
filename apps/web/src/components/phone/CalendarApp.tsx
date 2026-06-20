import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DAYS_OF_WEEK,
  SEASON_ICONS,
  SEASON_LENGTH,
  deriveCalendar,
  type CalendarEntry,
  type DayRecordBeat,
  type WorldCalendar,
} from '@dsim/shared';
import { api } from '../../lib/api';
import { useAppData } from '../../state/app-context';
import { useT, type TFunc } from '../../i18n';
import { seasonLabel, dayLabel } from '../../i18n/sharedLabels';
import { Icon } from '../Icon';
import { PhoneAppBar } from './PhoneAppBar';
import { Empty, Spinner } from '../ui';
import './phone-almanac.css';

const WEEKDAY_ABBR = DAYS_OF_WEEK.map((d) => d.slice(0, 2)); // Mo Tu We … Su

/** Which 28-day season-block a day falls in (0-based from day 1). */
const blockOf = (day: number) => Math.floor((day - 1) / SEASON_LENGTH);
const yearOf = (day: number) => Math.floor((day - 1) / (SEASON_LENGTH * 4)) + 1;

/** Beats longer than this (≈3 lines) collapse behind a "show more" so a fuller
 *  date recap doesn't bloat the day's "what happened" list. */
const BEAT_CLAMP_CHARS = 150;

/** One "what happened" beat. Long beats (e.g. a fuller date recap) clamp to a few
 *  lines with an inline expand toggle; short beats render plain. Remounted per day
 *  (keyed by day) so the expanded state never leaks between days. */
function DayBeat({ beat, t }: { beat: DayRecordBeat; t: TFunc }) {
  const [expanded, setExpanded] = useState(false);
  const long = beat.text.length > BEAT_CLAMP_CHARS;
  return (
    <div className={`pal-beat tone-${beat.tone}`}>
      <span className="pal-beat-icon" aria-hidden="true">
        {beat.icon}
      </span>
      <div className="pal-beat-body">
        <span className={`pal-beat-text${long && !expanded ? ' clamped' : ''}`}>{beat.text}</span>
        {long && (
          <button type="button" className="pal-beat-more" onClick={() => setExpanded((v) => !v)}>
            {expanded ? t('cal.showLess') : t('cal.showMore')}
          </button>
        )}
      </div>
    </div>
  );
}

/** A calendar / almanac of every day: weather, what happened, and the day's recap. */
export function CalendarApp() {
  const t = useT();
  const { activeWorldId, dayTick } = useAppData();
  const [data, setData] = useState<WorldCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [block, setBlock] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A world switch reuses this component — clear any open day-detail / closing
    // state so a stale day from the previous world can't surface as a phantom.
    setSelected(null);
    setClosing(false);
    if (!activeWorldId) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let live = true;
    void api
      .worldCalendar(activeWorldId)
      .then((d) => {
        if (!live) return;
        setData(d);
        setBlock(blockOf(d.currentDay)); // open on the current season
      })
      .catch(() => live && setData(null))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [activeWorldId, dayTick]);

  const byDay = useMemo(() => {
    const m = new Map<number, CalendarEntry>();
    for (const e of data?.entries ?? []) m.set(e.day, e);
    return m;
  }, [data]);

  // While the day-detail is open it is a modal takeover: make the calendar behind
  // it inert (out of the tab order + hidden from AT) so focus can't leak through.
  useEffect(() => {
    if (baseRef.current) baseRef.current.inert = selected != null;
  }, [selected]);

  const closeDay = useCallback(() => setClosing(true), []);
  const handleClosed = useCallback(() => {
    setSelected(null);
    setClosing(false);
  }, []);

  if (!activeWorldId) {
    return (
      <div className="phone-app">
        <PhoneAppBar title={t('phone.app.calendar')} kicker={t('cal.kicker')} icon="calendar" />
        <div className="pal-app">
          <Empty icon={<Icon name="calendar" size={36} />} title={t('phone.weather.noWorldTitle')}>
            <p className="muted">{t('cal.noWorldBody')}</p>
          </Empty>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="phone-app">
        <PhoneAppBar title={t('phone.app.calendar')} kicker={t('cal.kicker')} icon="calendar" />
        <div className="pal-app">{loading ? <Spinner /> : <p className="muted center">{t('cal.loadError')}</p>}</div>
      </div>
    );
  }

  const currentBlock = blockOf(data.currentDay);
  const viewBlock = block ?? currentBlock;
  const firstDay = viewBlock * SEASON_LENGTH + 1;
  const headCal = deriveCalendar(firstDay);
  const days = Array.from({ length: SEASON_LENGTH }, (_, i) => firstDay + i);
  const hasYears = data.currentDay > SEASON_LENGTH * 4;

  const openDay = (d: number) => {
    setSelected(d);
    setClosing(false);
  };

  const goToToday = () => {
    setBlock(currentBlock);
    setSelected(null);
  };

  return (
    <div className="phone-app pal-host">
      <div className="pal-base" ref={baseRef}>
      <PhoneAppBar
        title={t('phone.app.calendar')}
        kicker={t('cal.kicker')}
        icon="calendar"
        right={
          viewBlock !== currentBlock ? (
            <button className="pal-today-btn" onClick={goToToday} title={t('cal.jumpToday')}>
              {t('phone.weather.today')}
            </button>
          ) : null
        }
      />

      <div className="pal-app">
        {/* Season header — navigate between the seasons you've lived. */}
        <div className="pal-season">
          <button
            className="pal-nav"
            onClick={() => setBlock(Math.max(0, viewBlock - 1))}
            disabled={viewBlock <= 0}
            aria-label={t('cal.prevSeason')}
          >
            <Icon name="chevronRight" size={18} className="pal-flip" />
          </button>
          <div className="pal-season-mid">
            <span className="pal-season-icon">{SEASON_ICONS[headCal.season]}</span>
            <div className="pal-season-text">
              <span className="pal-season-name">{seasonLabel(t, headCal.season)}</span>
              <span className="pal-season-sub">
                {hasYears ? t('cal.year', { year: yearOf(firstDay) }) : ''}
                {t('cal.daysRange', { from: firstDay, to: firstDay + SEASON_LENGTH - 1 })}
              </span>
            </div>
          </div>
          <button
            className="pal-nav"
            onClick={() => setBlock(Math.min(currentBlock, viewBlock + 1))}
            disabled={viewBlock >= currentBlock}
            aria-label={t('cal.nextSeason')}
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>

        {/* Weekday legend — every season starts on a Monday. */}
        <div className="pal-week">
          {WEEKDAY_ABBR.map((w, i) => (
            <span key={i} className={`pal-wd${i >= 5 ? ' is-weekend' : ''}`}>
              {w}
            </span>
          ))}
        </div>

        {/* The 4×7 grid. Keyed by block so the entrance stagger replays on season change. */}
        <div className="pal-grid" key={viewBlock}>
          {days.map((d, i) => {
            const entry = byDay.get(d);
            const cal = deriveCalendar(d);
            const isFuture = d > data.currentDay;
            const isToday = d === data.currentDay;
            const rec = entry?.record ?? null;
            const beatCount = rec?.beats.length ?? 0;
            const cls = [
              'pal-cell',
              isFuture ? 'is-future' : 'is-past',
              isToday ? 'is-today' : '',
              cal.isWeekend ? 'is-weekend' : '',
              beatCount > 0 ? 'has-events' : '',
              cal.holiday ? 'is-holiday' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={d}
                className={cls}
                style={{ animationDelay: `${Math.min(i * 11, 260)}ms` }}
                disabled={isFuture}
                onClick={() => !isFuture && openDay(d)}
                title={`${t('cal.cellTitle', { day: d, dow: dayLabel(t, cal.dayOfWeek) })}${cal.holiday ? ` · ${cal.holiday.name}` : ''}`}
              >
                <span className="pal-cell-day">{d}</span>
                <span className="pal-cell-wx" aria-hidden="true">
                  {entry?.weather.icon ?? ''}
                </span>
                {cal.holiday && (
                  <span className="pal-cell-holiday" aria-hidden="true">
                    ✦
                  </span>
                )}
                {beatCount > 0 && !isToday && (
                  <span className="pal-cell-dots" aria-hidden="true">
                    {rec!.beats.slice(0, 3).map((b, bi) => (
                      <i key={bi} className={`tone-${b.tone}`} />
                    ))}
                  </span>
                )}
                {isToday && <span className="pal-cell-today">{t('phone.weather.today')}</span>}
              </button>
            );
          })}
        </div>

        <p className="pal-foot">
          {data.currentDay > 1 ? t('cal.footActive') : t('cal.footStart')}
        </p>
      </div>
      </div>

      {selected != null && byDay.has(selected) && (
        <DayDetail
          day={selected}
          entry={byDay.get(selected) ?? null}
          isToday={selected === data.currentDay}
          closing={closing}
          onClose={closeDay}
          onClosed={handleClosed}
        />
      )}
    </div>
  );
}

function DayDetail({
  day,
  entry,
  isToday,
  closing,
  onClose,
  onClosed,
}: {
  day: number;
  entry: CalendarEntry | null;
  isToday: boolean;
  closing: boolean;
  onClose: () => void;
  onClosed: () => void;
}) {
  const t = useT();
  const cal = deriveCalendar(day);
  const rec = entry?.record ?? null;
  const hasSummary = !!(rec && (rec.headline || rec.narrative));
  const backRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog when it opens (so keyboard/AT users land here).
  useEffect(() => {
    backRef.current?.focus();
  }, []);

  // Commit the unmount on a timer rather than on `animationend` — the close
  // animation is disabled under prefers-reduced-motion (no event would ever
  // fire), which would otherwise trap the user in the overlay. The timer matches
  // the out-animation; under reduced motion it closes immediately.
  useEffect(() => {
    if (!closing) return;
    const reduce =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = window.setTimeout(onClosed, reduce ? 0 : 280);
    return () => window.clearTimeout(t);
  }, [closing, onClosed]);

  return (
    <div
      className={`pal-detail ${closing ? 'is-closing' : 'is-opening'}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('cal.detailAria', { day })}
    >
      <div className="pal-detail-bar">
        <button className="pal-back" onClick={onClose} aria-label={t('cal.backToCalendar')} ref={backRef}>
          <Icon name="chevronRight" size={18} className="pal-flip" />
          <span>{t('cal.kicker')}</span>
        </button>
        {rec && rec.income > 0 && (
          <span className="pal-coin" title={t('cal.dailyIncome')}>
            <Icon name="coin" size={13} /> +{rec.income}
          </span>
        )}
      </div>

      <div className="pal-detail-scroll">
        {/* Date plate */}
        <div className="pal-plate">
          <div className="pal-plate-day">{t('dash.hud.day', { day })}</div>
          <div className="pal-plate-when">
            {SEASON_ICONS[cal.season]} {dayLabel(t, cal.dayOfWeek)} · {seasonLabel(t, cal.season)} {cal.seasonDay}
            {cal.isWeekend ? ` · ${t('dash.hud.weekend')}` : ''}
          </div>
          {entry && (
            <div className="pal-plate-wx">
              <span className="pal-plate-wx-icon">{entry.weather.icon}</span> {t('phone.weather.itsLabel', { label: entry.weather.label })}
            </div>
          )}
        </div>

        {cal.holiday && (
          <div className="pal-holiday-banner">
            <strong>✦ {cal.holiday.name}</strong>
            <span>{cal.holiday.blurb}</span>
          </div>
        )}

        {/* The generated summary of the day */}
        {hasSummary ? (
          <div className="pal-recap">
            {rec!.headline && <h3 className="pal-recap-head">{rec!.headline}</h3>}
            {rec!.narrative && <p className="pal-recap-body">{rec!.narrative}</p>}
            {!rec!.reconstructed && rec!.highlights.length > 0 && (
              <ul className="pal-highlights">
                {rec!.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
            {rec!.reconstructed && <div className="pal-recon">{t('cal.reconstructed')}</div>}
          </div>
        ) : (
          <div className="pal-recap pal-recap-quiet">
            <p className="muted">{isToday ? t('cal.todayUnfolding') : t('cal.quietDay')}</p>
          </div>
        )}

        {/* What happened — the day's beats */}
        {rec && rec.beats.length > 0 && (
          <>
            <div className="pal-eyebrow">{t('cal.whatHappened')}</div>
            <div className="pal-beats">
              {rec.beats.map((b, i) => (
                <DayBeat key={`${day}-${i}`} beat={b} t={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
