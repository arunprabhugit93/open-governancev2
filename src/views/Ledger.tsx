import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Download, Link2, Pencil, FileWarning } from 'lucide-react';
import { useEngine } from '@/lib/store';
import { shortHash } from '@/lib/hash';
import { Card, CardHeader, Badge, Button, Mono } from '@/components/ui/primitives';
import { PageHeader } from '@/components/ui/status';
import { cn } from '@/lib/cn';

export function Ledger() {
  const ledger = useEngine((s) => s.ledger);
  const tamperRecord = useEngine((s) => s.tamperRecord);
  const verifyLedger = useEngine((s) => s.verifyLedger);
  const exportEvidence = useEngine((s) => s.exportEvidence);

  const [broken, setBroken] = useState<number[] | null>(null);
  const [verifying, setVerifying] = useState(false);

  const runVerify = async () => {
    setVerifying(true);
    const b = await verifyLedger();
    setBroken(b);
    setVerifying(false);
  };

  const tamper = (seq: number) => {
    const current = ledger.find((e) => e.seq === seq);
    const next = prompt(
      'Rewrite this record\'s summary (the evaluator chooses the record). The stored hash will NOT be recomputed — verification should then detect the tamper.',
      current?.summary
    );
    if (next != null) {
      tamperRecord(seq, next);
      setBroken(null); // force a re-verify to reveal the break
    }
  };

  const download = async () => {
    const json = await exportEvidence();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nsaic-evidence-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBroken(null);
  };

  const brokenSet = new Set(broken ?? []);
  const anyTampered = ledger.some((e) => e.tampered);

  return (
    <div>
      <PageHeader
        title="Evidence Ledger"
        subtitle="A tamper-evident, hash-chained record of every decision. Each entry seals the previous one. Alter any record and verification detects it — on a record of your choosing, not one prepared in advance."
        claims={['C7']}
        right={
          <div className="flex gap-2">
            <Button variant="outline" tone="neutral" size="sm" onClick={() => void runVerify()}>
              <ShieldCheck className="h-3.5 w-3.5" /> {verifying ? 'Verifying…' : 'Verify chain'}
            </Button>
            <Button size="sm" onClick={() => void download()}>
              <Download className="h-3.5 w-3.5" /> Export evidence
            </Button>
          </div>
        }
      />

      {/* Verification banner */}
      {broken != null && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-4 flex items-center gap-3 rounded-lg border px-4 py-3',
            broken.length === 0
              ? 'border-pass/40 bg-pass/10'
              : 'border-fail/40 bg-fail/10 animate-shake'
          )}
        >
          {broken.length === 0 ? (
            <>
              <ShieldCheck className="h-5 w-5 text-pass" />
              <div>
                <div className="text-sm font-semibold text-pass">Chain intact — {ledger.length} records verified</div>
                <div className="text-xs text-muted">Every stored hash recomputes correctly from its predecessor.</div>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert className="h-5 w-5 text-fail" />
              <div>
                <div className="text-sm font-semibold text-fail">
                  Tamper detected — {broken.length} record{broken.length === 1 ? '' : 's'} fail verification
                </div>
                <div className="text-xs text-muted">
                  Records #{broken.join(', #')} no longer match the chain. Altering one record breaks it and every record sealed after it.
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      <Card>
        <CardHeader
          title="Chained records"
          subtitle={`${ledger.length} entries · SHA-256 chain`}
          right={
            anyTampered ? (
              <Badge tone="fail"><FileWarning className="mr-1 h-3 w-3" />contains altered record</Badge>
            ) : (
              <Badge tone="pass">append-only</Badge>
            )
          }
        />
        <div className="max-h-[540px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-faint">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Summary</th>
                <th className="px-3 py-2">prev → hash</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((e) => {
                const isBroken = brokenSet.has(e.seq);
                return (
                  <tr
                    key={e.seq}
                    className={cn(
                      'border-b border-border/60 align-top',
                      isBroken && 'bg-fail/8',
                      e.tampered && 'bg-fail/5'
                    )}
                  >
                    <td className="px-3 py-2">
                      <Mono className="text-faint">{e.seq}</Mono>
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone="neutral">{e.action}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <div className="max-w-md text-xs">
                        {e.summary}
                        {e.tampered && (
                          <span className="ml-1 font-semibold text-fail">(altered)</span>
                        )}
                      </div>
                      <Mono className="text-[10px] text-faint">
                        {e.actor} · {new Date(e.ts).toLocaleTimeString()}
                      </Mono>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Mono className="text-[10px] text-faint">{shortHash(e.prevHash)}</Mono>
                        <Link2 className="h-3 w-3 text-faint" />
                        <Mono className={cn('text-[10px]', isBroken ? 'text-fail' : 'text-info')}>
                          {shortHash(e.hash)}
                        </Mono>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" tone="fail" size="sm" onClick={() => tamper(e.seq)}>
                        <Pencil className="h-3 w-3" /> Tamper
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-3 text-xs text-muted">
        Choose any record and press <span className="font-medium">Tamper</span> to rewrite its contents, then press <span className="font-medium">Verify chain</span>. Tamper-evident custody is the basis of every other evidence claim.
      </p>
    </div>
  );
}
