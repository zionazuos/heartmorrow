import './characters.page.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAsync, errorMessage } from '../lib/hooks';
import { Portrait } from '../components/Portrait';
import { Icon } from '../components/Icon';
import { Banner, Empty, Loader, ConfirmDialog } from '../components/ui';
import { useAppData } from '../state/app-context';
import { useT } from '../i18n';

export function Characters() {
  const nav = useNavigate();
  const t = useT();
  const { creatorMode, activeWorldId, activeWorld, dayTick } = useAppData();
  const state = useAsync(() => api.listCharacters(), [activeWorldId, dayTick]);
  const memorials = useAsync(() => api.listMemorials(activeWorldId ?? undefined), [activeWorldId, dayTick]);
  const lost = new Set(memorials.data ?? []);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const duplicate = async (id: string) => {
    if (actingId) return;
    setActingId(id);
    try {
      const copy = await api.duplicateCharacter(id);
      nav(`/characters/${copy.id}/edit`); // navigates away
    } catch (e) {
      setActingId(null);
      alert(errorMessage(e));
    }
  };

  const remove = async (id: string) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.deleteCharacter(id);
      state.reload();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  // Recover a world-less ("unassigned") character by placing it into the active world.
  const moveToWorld = async (id: string) => {
    if (!activeWorldId || actingId) return;
    setActingId(id);
    try {
      await api.updateCharacter(id, { worldId: activeWorldId });
      state.reload();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="stack">
      <div className="page-head ppl-head">
        <div className="ppl-titles">
          <span className="kicker">{t('people.head.kicker')}</span>
          <h1>{t('people.head.title')}</h1>
          <p>{t('people.head.lede')}</p>
        </div>
        {creatorMode && (
          <Link className="btn primary" to="/characters/new">
            <Icon name="plus" size={16} /> {t('common.new')}
          </Link>
        )}
      </div>

      <Loader state={state}>
        {(allCharacters) => {
          // Only people from the active world appear in this world.
          const characters = allCharacters.filter((c) => !activeWorldId || c.worldId === activeWorldId);
          // World-less ("unassigned") characters belong to no world's roster — surface
          // them (creator mode) so they can be recovered instead of lost forever.
          const unassigned = creatorMode ? allCharacters.filter((c) => !c.worldId) : [];
          return (
            <>
              {characters.length === 0 ? (
            <Empty icon={<Icon name="people" size={34} />} title={t('people.empty.title')}>
              {creatorMode ? (
                <>
                  <p>{t('people.empty.createLede')}</p>
                  <Link className="btn primary" to="/characters/new">
                    {t('people.empty.createBtn')}
                  </Link>
                </>
              ) : (
                <p>{t('people.empty.playLede')}</p>
              )}
            </Empty>
          ) : (
            <>
              <div className="ppl-count">
                <span className="ppl-num">{characters.length}</span>{' '}
                {t(characters.length === 1 ? 'people.soulsOne' : 'people.soulsMany')}
              </div>
              <div className="ppl-gallery">
                {characters.map((c) => {
                  const memorial = lost.has(c.id);
                  return (
                  <article className={`ppl-plate${memorial ? ' ppl-memorial' : ''}`} key={c.id}>
                    <div className="ppl-frame">
                      <Link className="ppl-portrait-link" to={`/characters/${c.id}`}>
                        <Portrait character={c} memorial={memorial} />
                      </Link>
                    </div>

                    <div className="ppl-nameplate">
                      <h3 className="ppl-name">
                        <Link to={`/characters/${c.id}`}>{c.name}</Link>
                      </h3>
                      <div className="ppl-meta">
                        {memorial ? (
                          <span className="ppl-inmemoriam">{t('people.inMemoriam')}</span>
                        ) : (
                          <>
                            {c.age}
                            <span className="ppl-dot">·</span>
                            {c.pronouns}
                          </>
                        )}
                      </div>
                    </div>

                    <p
                      className={`ppl-desc${c.shortDescription ? '' : ' ppl-empty-desc'}`}
                    >
                      {c.shortDescription
                        ? c.shortDescription.length > 90
                          ? `${c.shortDescription.slice(0, 90).trimEnd()}…`
                          : c.shortDescription
                        : t('people.noDesc')}
                    </p>

                    <div className="ppl-actions">
                      {memorial ? (
                        <Link className="btn sm ghost ppl-date" to={`/characters/${c.id}`}>
                          <Icon name="remember" size={15} /> {t('people.remember')}
                        </Link>
                      ) : (
                        <Link className="btn sm primary ppl-date" to={`/chat?character=${c.id}`}>
                          <Icon name="date" size={15} /> {t('people.date')}
                        </Link>
                      )}
                      {creatorMode && (
                        <div className="ppl-creator-row">
                          <Link className="btn sm ghost" to={`/characters/${c.id}/edit`}>
                            <Icon name="edit" size={14} /> {t('common.edit')}
                          </Link>
                          <button className="btn sm ghost" onClick={() => duplicate(c.id)} disabled={actingId !== null}>
                            <Icon name="duplicate" size={14} /> {t('common.duplicate')}
                          </button>
                          <button className="btn sm danger" onClick={() => setPendingDelete({ id: c.id, name: c.name })}>
                            <Icon name="trash" size={14} /> {t('common.delete')}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                  );
                })}
              </div>
            </>
          )}

              {unassigned.length > 0 && (
                <section className="stack" style={{ marginTop: 24 }}>
                  <div className="section-head">
                    <div className="titles">
                      <span className="kicker">{t('people.unassigned.kicker')}</span>
                      <h2>{t('people.unassigned.title')}</h2>
                    </div>
                    <span className="trail" />
                  </div>
                  <p className="muted" style={{ marginTop: -6 }}>
                    {t('people.unassigned.lede')}
                    {activeWorld
                      ? t('people.unassigned.place', { world: activeWorld.name })
                      : t('people.unassigned.placeNoWorld')}
                  </p>
                  <div className="ppl-gallery">
                    {unassigned.map((c) => (
                      <article className="ppl-plate" key={c.id}>
                        <div className="ppl-frame">
                          <Link className="ppl-portrait-link" to={`/characters/${c.id}`}>
                            <Portrait character={c} />
                          </Link>
                        </div>
                        <div className="ppl-nameplate">
                          <h3 className="ppl-name">
                            <Link to={`/characters/${c.id}`}>{c.name}</Link>
                          </h3>
                          <div className="ppl-meta">
                            {c.age}
                            <span className="ppl-dot">·</span>
                            {c.pronouns}
                          </div>
                        </div>
                        <div className="ppl-actions">
                          <button
                            className="btn sm primary ppl-date"
                            disabled={!activeWorldId || actingId !== null}
                            onClick={() => moveToWorld(c.id)}
                          >
                            <Icon name="plus" size={15} /> {t('people.moveTo', { world: activeWorld?.name ?? t('people.worldFallback') })}
                          </button>
                          <div className="ppl-creator-row">
                            <Link className="btn sm ghost" to={`/characters/${c.id}/edit`}>
                              <Icon name="edit" size={14} /> {t('common.edit')}
                            </Link>
                            <button className="btn sm danger" onClick={() => setPendingDelete({ id: c.id, name: c.name })}>
                              <Icon name="trash" size={14} /> {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          );
        }}
      </Loader>
      {state.error && <Banner kind="error">{state.error}</Banner>}

      {pendingDelete && (
        <ConfirmDialog
          title={t('people.delete.title', { name: pendingDelete.name })}
          body={t('people.delete.body')}
          confirmLabel={t('common.delete')}
          danger
          busy={deleting}
          onConfirm={() => remove(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
