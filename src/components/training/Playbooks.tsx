import { Tooltip } from '@fluentui/react-components';
import { HatGraduation20Regular, Play20Regular } from '@fluentui/react-icons';
import { PLAYBOOKS, quickTest } from '../../lib/filters';
import { useApp, useData } from '../../store';

/** Training-mode bar: saved filters ("Playbooks") + guided tour launcher. */
export function Playbooks() {
  const training = useApp((s) => s.training);
  const quick = useApp((s) => s.quick);
  const setQuick = useApp((s) => s.setQuick);
  const setTourRunning = useApp((s) => s.setTourRunning);
  const { contextRows } = useData();
  if (!training) return null;
  return (
    <section className="playbooks" aria-label="Playbooks" data-tour="playbooks">
      <span className="playbooks-label">
        <HatGraduation20Regular /> Playbooks
      </span>
      {PLAYBOOKS.map((p) => {
        const active = quick?.kind === 'playbook' && quick.value === p.id;
        const count = contextRows.filter((t) => quickTest({ kind: 'playbook', value: p.id }, t)).length;
        return (
          <Tooltip
            key={p.id}
            relationship="description"
            withArrow
            content={
              <div className="tip" lang="es">
                <div className="tip-title">{p.label}</div>
                {p.note}
              </div>
            }
          >
            <button className={`pb-btn${active ? ' active' : ''}`} aria-pressed={active} onClick={() => setQuick(active ? null : { kind: 'playbook', value: p.id })}>
              {p.label} ({count})
            </button>
          </Tooltip>
        );
      })}
      <span style={{ flex: 1 }} />
      <button className="ghost-btn" onClick={() => setTourRunning(true)}>
        <Play20Regular /> Start guided tour
      </button>
    </section>
  );
}
