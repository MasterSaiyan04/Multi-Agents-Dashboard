import { useEffect, useState } from 'react';

import type { DocEntry } from '../../shared/mission';

interface DocsProps {
  docs: DocEntry[];
  initialWorkspaceId?: string | null;
}

function statusClass(status: DocEntry['status']) {
  if (status === 'completed' || status === 'active') return 'border-green-500/20 bg-green-500/10 text-green-400';
  if (status === 'building' || status === 'queued') return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
  if (status === 'error') return 'border-rose-500/20 bg-rose-500/10 text-rose-400';
  return 'border-[#333] bg-[#171717] text-gray-400';
}

export default function Docs({ docs, initialWorkspaceId }: DocsProps) {
  const [filter, setFilter] = useState<'all' | 'living-doc' | 'overnight-log'>('all');
  const [workspaceFilter, setWorkspaceFilter] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(docs[0]?.id || null);

  useEffect(() => {
    if (!initialWorkspaceId) {
      return;
    }
    setWorkspaceFilter(initialWorkspaceId);
  }, [initialWorkspaceId]);

  useEffect(() => {
    if (!docs.find((doc) => doc.id === selectedDocId)) {
      setSelectedDocId(docs[0]?.id || null);
    }
  }, [docs, selectedDocId]);

  const workspaceOptions = Array.from(
    new Set(docs.map((doc) => doc.workspaceId).filter(Boolean))
  ) as string[];

  const filteredDocs = docs.filter((doc) => {
    if (filter !== 'all' && doc.docType !== filter) {
      return false;
    }
    if (workspaceFilter !== 'all' && doc.workspaceId !== workspaceFilter) {
      return false;
    }
    return true;
  });

  const selectedDoc =
    filteredDocs.find((doc) => doc.id === selectedDocId) ||
    filteredDocs[0] ||
    null;

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-gray-500">Filters</div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'living-doc', 'overnight-log'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                    filter === value
                      ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                      : 'border-[#2d2d2d] bg-[#171717] text-gray-400 hover:text-gray-100'
                  }`}
                >
                  {value === 'all' ? 'All' : value}
                </button>
              ))}
            </div>

            <select
              value={workspaceFilter}
              onChange={(event) => setWorkspaceFilter(event.target.value)}
              className="w-full rounded-2xl border border-[#2d2d2d] bg-[#171717] px-3 py-3 text-sm text-gray-200 outline-none"
            >
              <option value="all">All workspaces</option>
              {workspaceOptions.map((workspaceId) => (
                <option key={workspaceId} value={workspaceId}>
                  {workspaceId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.24em] text-gray-500">Timeline</div>
            <div className="text-xs text-gray-600">{filteredDocs.length}</div>
          </div>
          <div className="space-y-2">
            {filteredDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selectedDoc?.id === doc.id
                    ? 'border-amber-400/30 bg-amber-500/10'
                    : 'border-[#242424] bg-[#151515] hover:border-[#343434]'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">{doc.docType}</span>
                </div>
                <div className="text-sm font-medium text-white">{doc.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-gray-500">{doc.summary}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6">
        {selectedDoc ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass(selectedDoc.status)}`}>
                    {selectedDoc.status}
                  </span>
                  <span className="rounded-full border border-[#2d2d2d] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                    {selectedDoc.docType}
                  </span>
                  {selectedDoc.workspaceId ? (
                    <span className="rounded-full border border-[#2d2d2d] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      {selectedDoc.workspaceId}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-3xl font-semibold text-white">{selectedDoc.title}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">{selectedDoc.summary}</p>
              </div>

              <div className="rounded-2xl border border-[#232323] bg-[#151515] px-4 py-3 text-sm text-gray-400">
                <div>{selectedDoc.owner}</div>
                <div className="text-xs text-gray-600">{selectedDoc.ownerRole}</div>
                <div className="mt-2 text-xs text-gray-600">
                  {selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleString() : 'No timestamp'}
                </div>
              </div>
            </div>

            {selectedDoc.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedDoc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#2d2d2d] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-7 text-gray-300">
                {selectedDoc.bodyMarkdown}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No docs match the current filters.</div>
        )}
      </section>
    </div>
  );
}
