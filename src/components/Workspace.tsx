import { ChevronRight, FileText, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { WorkspaceFileDetail, WorkspaceSnapshot } from '../../shared/mission';
import { fetchWorkspaceFile, saveWorkspaceFile } from '../lib/api';

interface WorkspaceProps {
  workspaces: WorkspaceSnapshot[];
  initialWorkspaceId?: string | null;
}

function formatSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${size} B`;
}

export default function Workspace({ workspaces, initialWorkspaceId }: WorkspaceProps) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    initialWorkspaceId || workspaces[0]?.id || null
  );
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [fileDetail, setFileDetail] = useState<WorkspaceFileDetail | null>(null);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0] || null;
  const files = activeWorkspace?.files || [];

  useEffect(() => {
    if (!initialWorkspaceId) {
      return;
    }
    setActiveWorkspaceId(initialWorkspaceId);
  }, [initialWorkspaceId]);

  useEffect(() => {
    if (!activeWorkspace) {
      return;
    }

    if (!activeWorkspace.files.find((file) => file.id === activeFileId)) {
      setActiveFileId(activeWorkspace.files[0]?.id || null);
    }
  }, [activeWorkspace, activeFileId]);

  useEffect(() => {
    async function loadFile() {
      if (!activeWorkspace || !activeFileId) {
        setFileDetail(null);
        setDraft('');
        return;
      }

      setIsLoading(true);
      setNotice(null);
      try {
        const detail = await fetchWorkspaceFile(activeWorkspace.id, activeFileId);
        setFileDetail(detail);
        setDraft(detail.content);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Unable to load file');
      } finally {
        setIsLoading(false);
      }
    }

    void loadFile();
  }, [activeWorkspace, activeFileId]);

  async function handleSave() {
    if (!activeWorkspace || !activeFileId) {
      return;
    }

    setIsSaving(true);
    setNotice(null);
    try {
      const detail = await saveWorkspaceFile(activeWorkspace.id, activeFileId, draft);
      setFileDetail(detail);
      setDraft(detail.content);
      setNotice('File saved and indexed into docs.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to save file');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 xl:flex-row">
      <aside className="w-full shrink-0 space-y-6 xl:w-80">
        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-gray-500">Workspaces</div>
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setActiveWorkspaceId(workspace.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  activeWorkspaceId === workspace.id
                    ? 'border-amber-400/30 bg-amber-500/10'
                    : 'border-[#242424] bg-[#151515] hover:border-[#343434]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${workspace.color}`}>
                    {workspace.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{workspace.name}</div>
                    <div className="truncate text-xs text-gray-500">
                      {workspace.branch || 'No branch'} · {workspace.activityCount} activities
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.24em] text-gray-500">Files</div>
            <div className="text-xs text-gray-600">{files.length} indexed</div>
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition-colors ${
                  activeFileId === file.id
                    ? 'border-amber-400/30 bg-amber-500/10'
                    : 'border-[#242424] bg-[#151515] hover:border-[#343434]'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText size={14} className="shrink-0 text-gray-500" />
                  <span className="truncate text-sm text-gray-200">{file.name}</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">{formatSize(file.size)}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="min-h-[70vh] flex-1 rounded-3xl border border-[#232323] bg-[#111111]">
        <div className="flex flex-col gap-4 border-b border-[#232323] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-sm text-gray-400">
            <span>{activeWorkspace?.name || 'Workspace'}</span>
            <ChevronRight size={14} className="shrink-0" />
            <span className="truncate text-gray-100">{fileDetail?.name || 'Select a file'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {fileDetail?.updatedAt ? new Date(fileDetail.updatedAt).toLocaleString() : ''}
            </span>
            <button
              onClick={handleSave}
              disabled={!fileDetail || isSaving}
              className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition-colors hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={14} />
              {isSaving ? 'Saving' : 'Save'}
            </button>
          </div>
        </div>

        {notice ? (
          <div className="border-b border-[#232323] px-5 py-3 text-sm text-amber-300">{notice}</div>
        ) : null}

        {activeWorkspace ? (
          <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4">
              {isLoading ? (
                <div className="h-[520px] animate-pulse rounded-2xl bg-[#151515]" />
              ) : (
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="h-[520px] w-full resize-none rounded-2xl border border-[#1f1f1f] bg-[#101010] p-4 font-mono text-sm leading-relaxed text-gray-300 outline-none ring-0 placeholder:text-gray-600 focus:border-amber-400/30"
                  spellCheck={false}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[#232323] bg-[#151515] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-gray-500">Workspace Health</div>
                <div className="mt-3 text-2xl font-semibold text-white">{activeWorkspace.name}</div>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{activeWorkspace.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#2f2f2f] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                    {activeWorkspace.status}
                  </span>
                  {activeWorkspace.branch ? (
                    <span className="rounded-full border border-[#2f2f2f] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      {activeWorkspace.branch}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-[#232323] bg-[#151515] p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-gray-500">Metadata</div>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div className="flex items-center justify-between gap-3">
                    <span>Activity</span>
                    <span className="font-mono text-gray-200">{activeWorkspace.activityCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Open items</span>
                    <span className="font-mono text-gray-200">{activeWorkspace.openItemsCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Root path</span>
                    <span className="max-w-[180px] truncate font-mono text-[11px] text-gray-500">
                      {activeWorkspace.rootPath || 'Virtual workspace'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>File size</span>
                    <span className="font-mono text-gray-200">
                      {fileDetail ? formatSize(fileDetail.size) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-gray-500">No workspaces found.</div>
        )}
      </section>
    </div>
  );
}
