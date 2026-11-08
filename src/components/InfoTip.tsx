import { Tooltip } from '@fluentui/react-components';
import { Info16Regular } from '@fluentui/react-icons';
import { DEFS, TRAINING_NOTES } from '../lib/dictionary';
import { useApp } from '../store';

/** Tooltip body: official English definition (+ Spanish training note in Training mode). */
export function TipContent({ term, forceNote }: { term: string; forceNote?: boolean }) {
  const training = useApp((s) => s.training);
  const note = TRAINING_NOTES[term];
  return (
    <div className="tip">
      <div className="tip-title">{term}</div>
      <div>{DEFS[term] ?? 'Definition not available.'}</div>
      {(training || forceNote) && note && (
        <div className="tip-note" lang="es">
          <b>Training note:</b> {note}
        </div>
      )}
    </div>
  );
}

/** Blue info icon with the official definition as tooltip. */
export function InfoTip({ term, className = 'info-btn' }: { term: string; className?: string }) {
  return (
    <Tooltip content={<TipContent term={term} />} relationship="description" withArrow positioning="above">
      <button type="button" className={className} aria-label={`${term} definition`}>
        <Info16Regular />
      </button>
    </Tooltip>
  );
}

/** Numbered highlight shown only in Training mode. */
export function TrainingBadge({ n, term, inline }: { n: number; term: string; inline?: boolean }) {
  const training = useApp((s) => s.training);
  if (!training) return null;
  return (
    <Tooltip content={<TipContent term={term} forceNote />} relationship="description" withArrow>
      <button type="button" className={`tbadge${inline ? ' inline' : ''}`} aria-label={`Training ${n}: ${term}`}>
        {n}
      </button>
    </Tooltip>
  );
}
