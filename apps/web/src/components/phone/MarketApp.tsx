import { useEffect, useState } from 'react';
import {
  STOCK_SECTOR_LABELS,
  type Company,
  type CompanyCreate,
  type MarketCompanyView,
  type MarketNews,
  type PortfolioPosition,
  type StockSector,
} from '@dsim/shared';
import { api } from '../../lib/api';
import { useAsync, errorMessage } from '../../lib/hooks';
import { useAppData } from '../../state/app-context';
import { useT, type TFunc } from '../../i18n';
import { Banner, Empty, Field, Loader, ConfirmDialog } from '../ui';
import { Icon } from '../Icon';
import { PhoneAppBar } from './PhoneAppBar';
import './phone-market.css';

const SECTORS: StockSector[] = ['tech', 'finance', 'industry', 'consumer', 'energy', 'media', 'health', 'realty'];

type Tab = 'market' | 'portfolio';

interface CompanyDraft {
  keep: boolean;
  company: CompanyCreate;
}

function fmtPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${(pct * 100).toFixed(1)}%`;
}

function pctClass(pct: number): string {
  return pct >= 0 ? 'mkt-up' : 'mkt-down';
}

function pnlClass(pnl: number): string {
  return pnl >= 0 ? 'mkt-up' : 'mkt-down';
}

/* ── Per-company trade row ─────────────────────────────────────────────── */
function CompanyRow({
  view,
  activeWorldId,
  tradingId,
  onTrade,
  t,
}: {
  view: MarketCompanyView;
  activeWorldId: string;
  tradingId: string | null;
  onTrade: (companyId: string, action: 'buy' | 'sell', shares: number) => void;
  t: TFunc;
}) {
  const { company, price, pct, shares } = view;
  const [buyQty, setBuyQty] = useState(1);
  const [sellQty, setSellQty] = useState(1);
  // Keep the sell quantity in sync with holdings after a trade/reload — never strand
  // a stale-high value that would jump back up on a later buy-back.
  useEffect(() => {
    setSellQty((q) => Math.min(q, Math.max(1, shares)));
  }, [shares]);
  const busy = tradingId !== null;

  return (
    <div className="ph-rise mkt-row card">
      <div className="mkt-row-head">
        <div className="mkt-ticker-block">
          <span className="mkt-ticker">{company.ticker}</span>
          <span className="mkt-sector-tag">{STOCK_SECTOR_LABELS[company.sector as StockSector] ?? company.sector}</span>
        </div>
        <div className="mkt-price-block">
          <span className="mkt-price">◈ {price}</span>
          <span className={`mkt-pct ${pctClass(pct)}`}>{fmtPct(pct)}</span>
        </div>
      </div>
      <div className="mkt-company-name">{company.name}</div>
      {company.description && <p className="mkt-desc">{company.description}</p>}
      <div className="mkt-row-meta">
        {company.dividendPerShare > 0 && (
          <span className="mkt-dividend">{t('mkt.dividend', { amount: company.dividendPerShare })}</span>
        )}
        {shares > 0 && (
          <span className="mkt-held">{t(shares === 1 ? 'mkt.youHoldOne' : 'mkt.youHoldMany', { count: shares })}</span>
        )}
      </div>
      <div className="mkt-trade-row">
        <div className="mkt-trade-group">
          <input
            className="mkt-qty-input"
            type="number"
            min={1}
            value={buyQty}
            onChange={(e) => setBuyQty(Math.max(1, Number(e.target.value) || 1))}
          />
          <button
            className="btn sm primary"
            disabled={busy}
            onClick={() => onTrade(company.id, 'buy', buyQty)}
          >
            {tradingId === company.id + '-buy' ? t('mkt.buying') : t('mkt.buy')}
          </button>
        </div>
        {shares > 0 && (
          <div className="mkt-trade-group">
            <input
              className="mkt-qty-input"
              type="number"
              min={1}
              max={shares}
              value={Math.min(sellQty, shares)}
              onChange={(e) => setSellQty(Math.max(1, Math.min(shares, Number(e.target.value) || 1)))}
            />
            <button
              className="btn sm ghost"
              disabled={busy}
              onClick={() => onTrade(company.id, 'sell', Math.min(sellQty, shares))}
            >
              {tradingId === company.id + '-sell' ? t('mkt.selling') : t('mkt.sell')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── News card ────────────────────────────────────────────────────────── */
function NewsCard({ item }: { item: MarketNews }) {
  return (
    <div className={`mkt-news-card mkt-sentiment-${item.sentiment}`}>
      <div className="mkt-news-ticker">{item.ticker ?? '—'}</div>
      <div className="mkt-news-headline">{item.headline}</div>
      {item.body && <p className="mkt-news-body">{item.body}</p>}
    </div>
  );
}

/* ── Portfolio position row ───────────────────────────────────────────── */
function PositionRow({ pos, t }: { pos: PortfolioPosition; t: TFunc }) {
  return (
    <div className="mkt-pos-row">
      <div className="mkt-pos-head">
        <span className="mkt-ticker">{pos.company.ticker}</span>
        <span className="mkt-pos-shares">{t('mkt.shAbbr', { count: pos.shares })}</span>
        <span className="mkt-pos-value">◈ {pos.value}</span>
      </div>
      <div className="mkt-pos-detail">
        <span className="mkt-pos-basis">{t('mkt.basis', { value: pos.costBasis })}</span>
        <span className={`mkt-pos-pnl ${pnlClass(pos.pnl)}`}>{pos.pnl >= 0 ? '+' : ''}◈ {pos.pnl}</span>
      </div>
    </div>
  );
}

/* ── Creator: draft editor for a generated company ───────────────────── */
function DraftCard({
  draft,
  index,
  onToggle,
  onEdit,
  t,
}: {
  draft: CompanyDraft;
  index: number;
  onToggle: (i: number) => void;
  onEdit: (i: number, patch: Partial<CompanyCreate>) => void;
  t: TFunc;
}) {
  const { company, keep } = draft;
  return (
    <div className={`mkt-draft${keep ? '' : ' dropped'}`}>
      <div className="mkt-draft-top">
        <label className="mkt-draft-keep">
          <input type="checkbox" checked={keep} onChange={() => onToggle(index)} />
          {keep ? t('mkt.keep') : t('mkt.skipped')}
        </label>
        <span className="mkt-money-pill">◈ {company.basePrice}</span>
      </div>
      <div className="inline-fields">
        <Field label={t('mkt.name')}>
          <input value={company.name} onChange={(e) => onEdit(index, { name: e.target.value })} />
        </Field>
        <Field label={t('mkt.ticker')}>
          <input
            value={company.ticker}
            maxLength={6}
            onChange={(e) => onEdit(index, { ticker: e.target.value.toUpperCase() })}
          />
        </Field>
      </div>
      <div className="inline-fields">
        <Field label={t('mkt.sector')}>
          <select
            value={company.sector}
            onChange={(e) => onEdit(index, { sector: e.target.value as StockSector })}
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>{STOCK_SECTOR_LABELS[s]}</option>
            ))}
          </select>
        </Field>
        <Field label={t('mkt.basePrice')}>
          <input
            type="number"
            min={1}
            value={company.basePrice}
            onChange={(e) => onEdit(index, { basePrice: Math.max(1, Number(e.target.value) || 1) })}
          />
        </Field>
      </div>
      <div className="inline-fields">
        <Field label={t('mkt.volatility')}>
          <input
            type="number"
            min={0}
            max={0.15}
            step={0.01}
            value={company.volatility}
            onChange={(e) => onEdit(index, { volatility: Math.max(0, Math.min(0.15, Number(e.target.value) || 0)) })}
          />
        </Field>
        <Field label={t('mkt.dividendShare')}>
          <input
            type="number"
            min={0}
            value={company.dividendPerShare ?? 0}
            onChange={(e) => onEdit(index, { dividendPerShare: Math.max(0, Number(e.target.value) || 0) })}
          />
        </Field>
      </div>
      <Field label={t('mkt.description')}>
        <textarea
          value={company.description ?? ''}
          onChange={(e) => onEdit(index, { description: e.target.value })}
        />
      </Field>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export function MarketApp() {
  const t = useT();
  const { player, reloadPlayer, creatorMode, activeWorld, activeWorldId, dayTick } = useAppData();

  const [tab, setTab] = useState<Tab>('market');
  const [note, setNote] = useState<string>();
  const [error, setError] = useState<string>();

  // Trade state
  const [tradingId, setTradingId] = useState<string | null>(null);

  // Creator: delete
  const [pendingDelete, setPendingDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Creator: generator panel
  const [genOpen, setGenOpen] = useState(false);
  const [genForm, setGenForm] = useState<{
    count: number;
    theme: string;
    sectorHint: '' | StockSector;
  }>({ count: 4, theme: '', sectorHint: '' });
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<CompanyDraft[]>([]);
  const [saving, setSaving] = useState(false);

  // Creator: manual new-company form
  const [newForm, setNewForm] = useState<Omit<CompanyCreate, 'worldId'>>({
    name: '',
    ticker: '',
    sector: 'tech',
    basePrice: 100,
    volatility: 0.04,
    dividendPerShare: 0,
    description: '',
    linkedCharacterId: null,
    assetId: null,
  });
  const [creatingNew, setCreatingNew] = useState(false);

  // Data loaders — only fire when we have a world. Keyed on dayTick so prices,
  // dividends, and news refetch after End day (the HUD net worth already does).
  const marketState = useAsync(
    () => (activeWorldId ? api.getMarket(activeWorldId) : Promise.reject(new Error('No world'))),
    [activeWorldId, dayTick],
  );
  const portfolioState = useAsync(
    () => (activeWorldId ? api.getPortfolio(activeWorldId) : Promise.reject(new Error('No world'))),
    [activeWorldId, dayTick],
  );

  if (!activeWorldId) {
    return (
      <div className="phone-app">
        <PhoneAppBar title={t('phone.app.market')} kicker={t('mkt.kicker')} icon="coin" />
        <div className="mkt-scroll">
          <Empty icon={<Icon name="coin" size={34} />} title={t('phone.weather.noWorldTitle')}>
            <p className="muted">{t('mkt.noWorldBody')}</p>
          </Empty>
        </div>
      </div>
    );
  }

  /* ── Trade handlers ─────────────────────────────────────────────────── */
  const trade = async (companyId: string, action: 'buy' | 'sell', shares: number) => {
    if (tradingId) return;
    setTradingId(`${companyId}-${action}`);
    setNote(undefined);
    setError(undefined);
    try {
      const res =
        action === 'buy'
          ? await api.buyStock(activeWorldId, companyId, shares)
          : await api.sellStock(activeWorldId, companyId, shares);
      await reloadPlayer();
      marketState.reload();
      portfolioState.reload();
      setNote(
        t(
          action === 'buy'
            ? shares === 1 ? 'mkt.tradeBoughtOne' : 'mkt.tradeBoughtMany'
            : shares === 1 ? 'mkt.tradeSoldOne' : 'mkt.tradeSoldMany',
          { count: shares, price: res.price },
        ),
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setTradingId(null);
    }
  };

  /* ── Delete handler ─────────────────────────────────────────────────── */
  const removeCompany = async (company: Company) => {
    if (deleting) return;
    setDeleting(true);
    setError(undefined);
    try {
      await api.deleteCompany(company.id);
      marketState.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  /* ── Generator ──────────────────────────────────────────────────────── */
  const generate = async () => {
    setGenerating(true);
    setError(undefined);
    setNote(undefined);
    setDrafts([]);
    try {
      const res = await api.generateCompanies(activeWorldId, {
        count: genForm.count,
        theme: genForm.theme,
        sectorHint: genForm.sectorHint || undefined,
        world: activeWorld
          ? { name: activeWorld.name, summary: activeWorld.summary, tone: activeWorld.tone, lore: activeWorld.lore, rules: activeWorld.rules }
          : undefined,
      });
      if (res.ok) {
        setDrafts(res.data.map((c) => ({ keep: true, company: c })));
      } else {
        setError(t('mkt.genFailed', { error: res.error }));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  const editDraft = (i: number, patch: Partial<CompanyCreate>) =>
    setDrafts((ds) => ds.map((d, idx) => (idx === i ? { ...d, company: { ...d.company, ...patch } } : d)));
  const toggleDraft = (i: number) =>
    setDrafts((ds) => ds.map((d, idx) => (idx === i ? { ...d, keep: !d.keep } : d)));
  const keptCount = drafts.filter((d) => d.keep).length;

  const saveDrafts = async () => {
    setSaving(true);
    setError(undefined);
    try {
      const kept = drafts.filter((d) => d.keep).map((d) => d.company);
      for (const c of kept) await api.createCompany({ ...c, worldId: activeWorldId });
      setNote(t(kept.length === 1 ? 'mkt.savedOne' : 'mkt.savedMany', { count: kept.length }));
      setGenOpen(false);
      setDrafts([]);
      marketState.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  /* ── Manual create ──────────────────────────────────────────────────── */
  const createNew = async () => {
    if (creatingNew || !newForm.name.trim() || !newForm.ticker.trim()) return;
    setCreatingNew(true);
    setError(undefined);
    try {
      await api.createCompany({ ...newForm, worldId: activeWorldId });
      setNote(t('mkt.created', { ticker: newForm.ticker }));
      setNewForm({ name: '', ticker: '', sector: 'tech', basePrice: 100, volatility: 0.04, dividendPerShare: 0, description: '', linkedCharacterId: null, assetId: null });
      marketState.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setCreatingNew(false);
    }
  };

  const money = player?.money ?? 0;

  return (
    <div className="phone-app">
      <PhoneAppBar title={t('phone.app.market')} kicker={t('mkt.kicker')} icon="coin" />

      <div className="mkt-scroll">
        {/* ── Purse strip ─────────────────────────────────────────────── */}
        <div className="mkt-purse-bar">
          <span className="mkt-purse-label">{t('mkt.cash')}</span>
          <span className="mkt-purse-coin">◈ {money}</span>
        </div>

        {/* ── Notifications ───────────────────────────────────────────── */}
        {note && <Banner kind="ok">{note}</Banner>}
        {error && <Banner kind="error">{error}</Banner>}

        {/* ── Tab bar ─────────────────────────────────────────────────── */}
        <div className="mkt-tabs" role="tablist">
          <button
            className={`mkt-tab${tab === 'market' ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === 'market'}
            onClick={() => setTab('market')}
          >
            <Icon name="coin" size={14} /> {t('mkt.tabMarket')}
          </button>
          <button
            className={`mkt-tab${tab === 'portfolio' ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === 'portfolio'}
            onClick={() => setTab('portfolio')}
          >
            <Icon name="trophy" size={14} /> {t('mkt.tabPortfolio')}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            MARKET TAB
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'market' && (
          <>
            {/* Creator: generate + new-company forms */}
            {creatorMode && (
              <div className="mkt-creator framed stack">
                <div className="mkt-creator-head">
                  <div>
                    <div className="kicker">{t('mkt.workshop')}</div>
                    <h3 style={{ margin: 0 }}>{t('mkt.companies')}</h3>
                  </div>
                  {!genOpen && (
                    <button className="btn sm primary" onClick={() => setGenOpen(true)}>
                      <Icon name="generate" size={14} /> {t('mkt.generate')}
                    </button>
                  )}
                </div>

                {genOpen && (
                  <div className="mkt-gen stack">
                    <div className="mkt-gen-header">
                      <div className="kicker">{t('mkt.genFromLore')}</div>
                      <button className="btn ghost sm" onClick={() => { setGenOpen(false); setDrafts([]); }}>
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                    <div className="inline-fields">
                      <Field label={t('mkt.count')}>
                        <input
                          type="number"
                          min={1}
                          max={8}
                          value={genForm.count}
                          onChange={(e) => setGenForm({ ...genForm, count: Math.max(1, Math.min(8, Number(e.target.value) || 1)) })}
                        />
                      </Field>
                      <Field label={t('mkt.sectorHint')}>
                        <select
                          value={genForm.sectorHint}
                          onChange={(e) => setGenForm({ ...genForm, sectorHint: e.target.value as '' | StockSector })}
                        >
                          <option value="">{t('mkt.any')}</option>
                          {SECTORS.map((s) => (
                            <option key={s} value={s}>{STOCK_SECTOR_LABELS[s]}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label={t('mkt.theme')} hint={t('mkt.themeHint')}>
                      <textarea
                        value={genForm.theme}
                        placeholder={t('mkt.themePlaceholder')}
                        onChange={(e) => setGenForm({ ...genForm, theme: e.target.value })}
                      />
                    </Field>
                    <div className="row">
                      <button className="btn primary" onClick={generate} disabled={generating}>
                        {generating ? t('editor.generating') : <><Icon name="generate" size={14} /> {t('mkt.generate')}</>}
                      </button>
                      {drafts.length > 0 && (
                        <button className="btn" onClick={saveDrafts} disabled={saving || keptCount === 0}>
                          {saving ? t('common.saving') : t('mkt.saveSelected', { count: keptCount })}
                        </button>
                      )}
                    </div>

                    {drafts.length > 0 && (
                      <>
                        <div className="mkt-gen-divider">{t('mkt.reviewRefine')}</div>
                        <div className="mkt-drafts">
                          {drafts.map((d, i) => (
                            <DraftCard
                              key={i}
                              draft={d}
                              index={i}
                              onToggle={toggleDraft}
                              onEdit={editDraft}
                              t={t}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Manual new-company form */}
                <div className="mkt-new-form stack">
                  <div className="kicker">{t('mkt.newCompany')}</div>
                  <div className="inline-fields">
                    <Field label={t('mkt.name')}>
                      <input
                        value={newForm.name}
                        placeholder="Apex Corp"
                        onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                      />
                    </Field>
                    <Field label={t('mkt.ticker')}>
                      <input
                        value={newForm.ticker}
                        placeholder="APEX"
                        maxLength={6}
                        onChange={(e) => setNewForm({ ...newForm, ticker: e.target.value.toUpperCase() })}
                      />
                    </Field>
                  </div>
                  <div className="inline-fields">
                    <Field label={t('mkt.sector')}>
                      <select
                        value={newForm.sector}
                        onChange={(e) => setNewForm({ ...newForm, sector: e.target.value as StockSector })}
                      >
                        {SECTORS.map((s) => (
                          <option key={s} value={s}>{STOCK_SECTOR_LABELS[s]}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('mkt.basePrice')}>
                      <input
                        type="number"
                        min={1}
                        value={newForm.basePrice}
                        onChange={(e) => setNewForm({ ...newForm, basePrice: Math.max(1, Number(e.target.value) || 1) })}
                      />
                    </Field>
                  </div>
                  <div className="inline-fields">
                    <Field label={t('mkt.volatility')}>
                      <input
                        type="number"
                        min={0}
                        max={0.15}
                        step={0.01}
                        value={newForm.volatility}
                        onChange={(e) => setNewForm({ ...newForm, volatility: Math.max(0, Math.min(0.15, Number(e.target.value) || 0)) })}
                      />
                    </Field>
                    <Field label={t('mkt.dividendShare')}>
                      <input
                        type="number"
                        min={0}
                        value={newForm.dividendPerShare}
                        onChange={(e) => setNewForm({ ...newForm, dividendPerShare: Math.max(0, Number(e.target.value) || 0) })}
                      />
                    </Field>
                  </div>
                  <Field label={t('mkt.description')}>
                    <textarea
                      value={newForm.description ?? ''}
                      placeholder={t('mkt.descPlaceholder')}
                      onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    />
                  </Field>
                  <button
                    className="btn primary"
                    onClick={createNew}
                    disabled={creatingNew || !newForm.name.trim() || !newForm.ticker.trim()}
                  >
                    <Icon name="plus" size={15} /> {creatingNew ? t('mkt.creating') : t('mkt.createCompany')}
                  </button>
                </div>
              </div>
            )}

            {/* Market board */}
            <Loader state={marketState}>
              {(market) =>
                market.companies.length === 0 ? (
                  <Empty icon={<Icon name="coin" size={34} />} title={t('mkt.noCompaniesTitle')}>
                    <p className="muted">
                      {creatorMode ? t('mkt.noCompaniesCreator') : t('mkt.noCompaniesPlay')}
                    </p>
                  </Empty>
                ) : (
                  <>
                    <div className="mkt-eyebrow">
                      <Icon name="coin" size={12} /> {t(market.companies.length === 1 ? 'mkt.listingsOne' : 'mkt.listingsMany', { count: market.companies.length })}
                    </div>
                    <div className="mkt-board">
                      {market.companies.map((view) => (
                        <div key={view.company.id} className="mkt-row-wrap">
                          <CompanyRow
                            view={view}
                            activeWorldId={activeWorldId}
                            tradingId={tradingId}
                            onTrade={trade}
                            t={t}
                          />
                          {creatorMode && (
                            <button
                              className="btn danger ghost sm mkt-delete-btn"
                              title={t('mkt.deleteCompany')}
                              aria-label={t('mkt.deleteAria', { name: view.company.name })}
                              onClick={() => setPendingDelete(view.company)}
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* News */}
                    {market.news.length > 0 && (
                      <>
                        <div className="mkt-eyebrow">
                          <Icon name="chronicle" size={12} /> {t('mkt.headlines')}
                        </div>
                        <div className="mkt-news-list">
                          {market.news.map((item) => (
                            <NewsCard key={item.id} item={item} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )
              }
            </Loader>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PORTFOLIO TAB
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'portfolio' && (
          <Loader state={portfolioState}>
            {(portfolio) =>
              portfolio.positions.length === 0 ? (
                <Empty icon={<Icon name="trophy" size={34} />} title={t('mkt.noHoldingsTitle')}>
                  <p className="muted">{t('mkt.noHoldingsBody')}</p>
                </Empty>
              ) : (
                <>
                  <div className="mkt-portfolio-summary framed">
                    <div className="mkt-port-stat">
                      <span className="mkt-port-label">{t('mkt.portfolioValue')}</span>
                      <span className="mkt-port-value">◈ {portfolio.value}</span>
                    </div>
                    <div className="mkt-port-stat">
                      <span className="mkt-port-label">{t('mkt.cash')}</span>
                      <span className="mkt-port-value">◈ {portfolio.cash}</span>
                    </div>
                  </div>
                  <div className="mkt-eyebrow">
                    <Icon name="trophy" size={12} /> {t('mkt.positions', { count: portfolio.positions.length })}
                  </div>
                  <div className="mkt-positions">
                    {portfolio.positions.map((pos) => (
                      <PositionRow key={pos.company.id} pos={pos} t={t} />
                    ))}
                  </div>
                </>
              )
            }
          </Loader>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title={t('people.delete.title', { name: pendingDelete.name })}
          body={t('mkt.deleteBody')}
          confirmLabel={t('common.delete')}
          danger
          busy={deleting}
          onConfirm={() => removeCompany(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
