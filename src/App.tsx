/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import TaskManager from './components/TaskManager';
import OrgChart from './components/OrgChart';
import Standup from './components/Standup';
import Workspace from './components/Workspace';
import Docs from './components/Docs';

export default function App() {
  const [activeTab, setActiveTab] = useState('Task Manager');

  return (
    <div className="flex h-screen bg-[#111111] text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'Task Manager' && <TaskManager />}
          {activeTab === 'Org Chart' && <OrgChart />}
          {activeTab === 'Standup' && <Standup />}
          {activeTab === 'Workspace' && <Workspace />}
          {activeTab === 'Docs' && <Docs />}
        </main>
      </div>
    </div>
  );
}
