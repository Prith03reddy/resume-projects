import React, { useState } from 'react';
import {
  ClipboardCheck,
  Droplet,
  ShieldAlert,
  Stethoscope,
  CheckSquare,
  Square,
  Sparkles,
  AlertOctagon,
  Syringe,
} from 'lucide-react';

export default function MedicalPrepList({ patient, telematics, isDark = true }) {
  const bloodGroup = patient?.bloodGroup || 'O-';
  const allergies = Array.isArray(patient?.allergies) ? patient.allergies : [];
  const peakG = parseFloat(telematics?.peakGForce || 4.85);

  // Dynamically generate actionable clinical preparation tasks based on EMR & Kinematics
  const initialTasks = [
    {
      id: 'blood-prep',
      category: 'BLOOD BANK',
      title: `Prepare 4 Units Packed RBCs (${bloodGroup} Type-Specific)`,
      desc: bloodGroup.includes('-')
        ? 'Universal Rh-negative critical priority. Thaw and prime rapid infuser.'
        : `Cross-match active. Hold 2 units uncrossed ${bloodGroup} in trauma cooler.`,
      icon: Droplet,
      priority: 'CRITICAL',
      color: 'rose',
    },
    ...(allergies.length > 0 && !allergies.includes('No Known Drug Allergies')
      ? [
          {
            id: 'allergy-prep',
            category: 'PHARMACOLOGY',
            title: `Contraindication Warning: Avoid ${allergies.join(', ')}`,
            desc: 'Tag medication cart. Have Epinephrine 1:1000 and Diphenhydramine 50mg on tray.',
            icon: ShieldAlert,
            priority: 'HIGH',
            color: 'amber',
          },
        ]
      : []),
    {
      id: 'trauma-gear',
      category: 'ATLS RESUSCITATION',
      title: peakG >= 4.0
        ? 'Deploy Rigid Cervical Collar & Pelvic Binder'
        : 'Prepare Spinal Motion Restriction Equipment',
      desc: `High-g impact signature (${peakG}g). Assume occult multisystem trauma until cleared.`,
      icon: Stethoscope,
      priority: 'HIGH',
      color: 'blue',
    },
    {
      id: 'chest-tube',
      category: 'PROCEDURAL',
      title: 'Prepare Chest Tube Tray & FAST Ultrasound',
      desc: 'Blunt thoracic impact protocol. Prime suction canister to -20 cm H2O.',
      icon: Syringe,
      priority: 'MEDIUM',
      color: 'cyan',
    },
  ];

  const [completedTasks, setCompletedTasks] = useState({});

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / initialTasks.length) * 100);

  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm space-y-3.5 transition ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-slate-950/40'
          : 'bg-white border-blue-100 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span>Actionable Medical Prep Checklist</span>
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Dynamic trauma bay items generated from victim's EMR
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold text-sky-400">
            {completedCount}/{initialTasks.length} Ready
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              completedCount === initialTasks.length
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {completedCount === initialTasks.length ? 'ALL PREPARED' : `${progressPercent}%`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Actionable List */}
      <div className="space-y-2 pt-1">
        {initialTasks.map((task) => {
          const isDone = !!completedTasks[task.id];
          const Icon = task.icon;

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-xl border transition cursor-pointer select-none flex items-start space-x-3 ${
                isDone
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                    : 'bg-emerald-50 border-emerald-200 opacity-80'
                  : isDark
                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 hover:text-white transition"
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                        task.priority === 'CRITICAL'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {task.category}
                    </span>
                    <h4
                      className={`text-xs font-bold truncate ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>
                </div>
                <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {task.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

