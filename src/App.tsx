/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Activity, 
  Info, 
  RefreshCw, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X, 
  Settings2, 
  ArrowRightLeft, 
  Weight, 
  FlaskConical, 
  Save, 
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type CalculationMode = 'rate-to-gamma' | 'gamma-to-rate';

interface Preset {
  id: string;
  name: string;
  amount: string;
  volume: string;
  isUndiluted: boolean;
}

const DEFAULT_PRESETS: Preset[] = [
  { id: '1', name: '100mg / 50ml', amount: '100', volume: '50', isUndiluted: false },
  { id: '2', name: '600mg / 200ml', amount: '600', volume: '200', isUndiluted: false },
  { id: '3', name: 'Undiluted (1mg/ml)', amount: '1', volume: '1', isUndiluted: true },
  { id: '4', name: 'Undiluted (0.06mg/ml)', amount: '0.06', volume: '1', isUndiluted: true },
];

export default function App() {
  const [mode, setMode] = useState<CalculationMode>('gamma-to-rate');
  const [weight, setWeight] = useState<string>('60');
  const [drugAmount, setDrugAmount] = useState<string>('100'); // mg
  const [volume, setVolume] = useState<string>('50'); // ml
  const [gamma, setGamma] = useState<string>('3'); // μg/kg/min
  const [rate, setRate] = useState<string>(''); // ml/h
  const [isUndiluted, setIsUndiluted] = useState<boolean>(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [tempPresetName, setTempPresetName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load presets from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gamma-calc-presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        setPresets(DEFAULT_PRESETS);
      }
    } else {
      setPresets(DEFAULT_PRESETS);
    }
  }, []);

  // Save presets to local storage
  useEffect(() => {
    if (presets.length > 0) {
      localStorage.setItem('gamma-calc-presets', JSON.stringify(presets));
    }
  }, [presets]);

  // Concentration (mg/mL)
  const concentration = useMemo(() => {
    const d = parseFloat(drugAmount);
    const v = parseFloat(volume);
    if (isNaN(d)) return 0;
    if (isUndiluted) return d;
    if (isNaN(v) || v === 0) return 0;
    return d / v;
  }, [drugAmount, volume, isUndiluted]);

  // Real-time calculation
  useEffect(() => {
    const w = parseFloat(weight);
    const d = parseFloat(drugAmount);
    const v = parseFloat(volume);
    const g = parseFloat(gamma);
    const r = parseFloat(rate);

    if (isNaN(w) || isNaN(d) || (!isUndiluted && (isNaN(v) || v === 0)) || concentration === 0) return;

    if (mode === 'gamma-to-rate') {
      if (isNaN(g)) return;
      const calculatedRate = (g * w * 60) / (concentration * 1000);
      setRate(calculatedRate.toFixed(2));
    } else {
      if (isNaN(r)) return;
      const calculatedGamma = (r * concentration * 1000) / (w * 60);
      setGamma(calculatedGamma.toFixed(2));
    }
  }, [weight, drugAmount, volume, gamma, rate, mode, isUndiluted, concentration]);

  const handleReset = () => {
    setWeight('60');
    setDrugAmount('100');
    setVolume('50');
    setGamma('3');
    setRate('');
  };

  const applyPreset = (preset: Preset) => {
    setIsUndiluted(preset.isUndiluted);
    setDrugAmount(preset.amount);
    if (!preset.isUndiluted) {
      setVolume(preset.volume);
    }
  };

  const openAddModal = () => {
    const defaultName = isUndiluted 
      ? `Undiluted (${drugAmount}mg/ml)` 
      : `${drugAmount}mg / ${volume}ml`;
    
    setEditingPreset({
      id: '',
      name: defaultName,
      amount: drugAmount,
      volume: isUndiluted ? '1' : volume,
      isUndiluted
    });
    setTempPresetName(defaultName);
    setIsEditModalOpen(true);
  };

  const openEditModal = (preset: Preset) => {
    setEditingPreset(preset);
    setTempPresetName(preset.name);
    setIsEditModalOpen(true);
  };

  const handleSavePreset = () => {
    if (!editingPreset) return;

    const newPreset = {
      ...editingPreset,
      name: tempPresetName || editingPreset.name,
      id: editingPreset.id || Date.now().toString()
    };

    if (editingPreset.id) {
      setPresets(presets.map(p => p.id === editingPreset.id ? newPreset : p));
    } else {
      setPresets([...presets, newPreset]);
    }
    
    setIsEditModalOpen(false);
    setEditingPreset(null);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
  };

  return (    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-vibrant-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none" />

      {/* Navigation */}
      <nav className="bg-slate-950/80 backdrop-blur-md text-white sticky top-0 z-30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-brand-400 to-vibrant-400 p-2 rounded-xl shadow-lg shadow-brand-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-200 to-vibrant-200">γ-CALC</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Precision Engine</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Reset all values"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration & Presets */}
          <div className="lg:col-span-4 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <History className="w-3.5 h-3.5" />
                  Presets
                </h2>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsManageModalOpen(true);
                  }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 relative z-10"
                >
                  <Settings2 className="w-3 h-3" />
                  Manage
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                  <button 
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:shadow-md transition-all active:scale-95"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </section>

            <div className="glass-card p-6 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
              
              {/* Patient Weight */}
              <div className="space-y-3 relative">
                <div className="flex items-center gap-2 text-slate-400">
                  <Weight className="w-4 h-4" />
                  <label className="text-xs font-bold tracking-wider uppercase">Patient Weight</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={weight}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (parseFloat(val) < 0) return;
                      setWeight(val);
                    }}
                    className="w-full text-4xl font-bold bg-transparent border-b-2 border-slate-100 focus:border-brand-500 focus:outline-none pb-2 transition-colors"
                    placeholder="0"
                  />
                  <span className="absolute right-0 bottom-3 text-slate-400 font-bold">kg</span>
                </div>
              </div>

              {/* Drug Composition */}
              <div className="space-y-4 pt-4 border-t border-slate-100 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FlaskConical className="w-4 h-4" />
                    <label className="text-xs font-bold tracking-wider uppercase">Drug Composition</label>
                  </div>
                  <button
                    onClick={() => setIsUndiluted(!isUndiluted)}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all ${
                      isUndiluted 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Undiluted Mode
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                      {isUndiluted ? 'Concentration (mg/ml)' : 'Drug Dose (mg)'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={drugAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        setDrugAmount(val);
                      }}
                      className="w-full text-xl font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-brand-500 focus:outline-none transition-all"
                    />
                  </div>
                  
                  {!isUndiluted && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold tracking-wider">Total Volume (ml)</span>
                      <input
                        type="number"
                        min="0"
                        value={volume}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (parseFloat(val) < 0) return;
                          setVolume(val);
                        }}
                        className="w-full text-xl font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 focus:border-brand-500 focus:outline-none transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100">
                    Final: {concentration.toFixed(3)} mg/ml
                  </div>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Preset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Main Calculator */}
          <div className="lg:col-span-8">
            <div className="glass-card rounded-[2.5rem] p-8 md:p-12 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-brand-500" />
                  Calculation Engine
                </h2>
                <div className="bg-slate-100 p-1 rounded-2xl flex w-full sm:w-auto">
                  <button
                    onClick={() => setMode('gamma-to-rate')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      mode === 'gamma-to-rate' 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Find Rate
                  </button>
                  <button
                    onClick={() => setMode('rate-to-gamma')}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      mode === 'rate-to-gamma' 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Find γ
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-12">
                {/* Gamma Input */}
                <div className={`relative group transition-all duration-500 ${mode === 'rate-to-gamma' ? 'opacity-40 scale-95' : 'scale-105'}`}>
                  <div className="absolute -top-6 left-0 flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Target Dosage (γ)</span>
                    {mode === 'gamma-to-rate' && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />}
                  </div>
                  <div className="flex items-end gap-4">
                    <input
                      type="number"
                      min="0"
                      value={gamma}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        setGamma(val);
                      }}
                      disabled={mode === 'rate-to-gamma'}
                      className={`w-full text-5xl sm:text-7xl md:text-8xl font-bold bg-transparent focus:outline-none transition-all ${
                        mode === 'rate-to-gamma' ? 'text-slate-400' : 'text-slate-900 text-glow'
                      }`}
                      placeholder="0.0"
                    />
                    <div className="pb-4">
                      <span className="text-xl md:text-2xl font-bold text-slate-500">μg/kg/min</span>
                    </div>
                  </div>
                  <div className={`h-1.5 rounded-full transition-all duration-700 ${mode === 'gamma-to-rate' ? 'bg-gradient-to-r from-brand-500 via-vibrant-400 to-brand-600 w-full shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'bg-slate-100 w-1/4'}`} />
                </div>

                {/* Transition Icon / Toggle Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setMode(mode === 'gamma-to-rate' ? 'rate-to-gamma' : 'gamma-to-rate')}
                    className={`p-4 rounded-full bg-white border-2 transition-all duration-500 shadow-xl hover:scale-110 active:scale-95 group/toggle ${
                      mode === 'gamma-to-rate' 
                        ? 'border-brand-500 text-brand-500 shadow-brand-500/20' 
                        : 'border-vibrant-500 text-vibrant-500 shadow-vibrant-500/20 rotate-180'
                    }`}
                    title={mode === 'gamma-to-rate' ? 'Switch to Find γ' : 'Switch to Find Rate'}
                  >
                    <ArrowRightLeft className="w-8 h-8 transition-transform" />
                  </button>
                </div>

                {/* Rate Input */}
                <div className={`relative group transition-all duration-500 ${mode === 'gamma-to-rate' ? 'opacity-40 scale-95' : 'scale-105'}`}>
                  <div className="absolute -top-6 right-0 flex items-center gap-2">
                    {mode === 'rate-to-gamma' && <div className="w-1.5 h-1.5 rounded-full bg-vibrant-500 animate-pulse" />}
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Infusion Speed</span>
                  </div>
                  <div className="flex items-end justify-end gap-4">
                    <div className="pb-4">
                      <span className="text-xl md:text-2xl font-bold text-slate-500">ml/h</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={rate}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (parseFloat(val) < 0) return;
                        setRate(val);
                      }}
                      disabled={mode === 'gamma-to-rate'}
                      className={`w-full text-5xl sm:text-7xl md:text-8xl font-bold bg-transparent focus:outline-none text-right transition-all ${
                        mode === 'gamma-to-rate' ? 'text-slate-400' : 'text-slate-900 text-glow'
                      }`}
                      placeholder="0.0"
                    />
                  </div>
                  <div className={`h-1.5 rounded-full transition-all duration-700 ml-auto ${mode === 'rate-to-gamma' ? 'bg-gradient-to-l from-vibrant-400 via-brand-500 to-vibrant-600 w-full shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-slate-100 w-1/4'}`} />
                </div>
              </div>

              {/* Success Notification */}
              <AnimatePresence>
                {showSaveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold">Preset saved successfully</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </main>

      {/* Ultra-Compact Formula Reference at the very bottom */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-slate-200 py-3 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black tracking-widest text-slate-400">Rate (ml/h)</span>
            <span className="text-[10px] font-mono text-slate-500">(γ × Wt × 60) / (Conc × 1000)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black tracking-widest text-slate-400">γ (μg/kg/min)</span>
            <span className="text-[10px] font-mono text-slate-500">(Rate × Conc × 1000) / (Wt × 60)</span>
          </div>
          <div className="hidden md:block h-3 w-px bg-slate-200 mx-2" />
          <p className="text-[9px] font-bold text-brand-500/60 uppercase tracking-tighter">
            Verify doses with clinical protocols.
          </p>
        </div>
      </footer>

      {/* Manage Presets Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">Preset Library</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drug Composition Database</p>
                </div>
                <button 
                  onClick={() => setIsManageModalOpen(false)}
                  className="p-3 bg-white text-slate-400 hover:text-slate-900 rounded-2xl shadow-sm transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar">
                {presets.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium italic">No presets found in library</p>
                  </div>
                ) : (
                  presets.map(preset => (
                    <div key={preset.id} className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 rounded-2xl border border-slate-100 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-500 font-bold text-xs">
                          {preset.isUndiluted ? 'U' : 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{preset.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                            {preset.isUndiluted ? 'Undiluted' : `${preset.amount}mg / ${preset.volume}ml`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 transition-opacity">
                        <button 
                          onClick={() => openEditModal(preset)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:text-brand-600 hover:bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deletePreset(preset.id)}
                          className="p-2.5 bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-white rounded-xl border border-slate-200 shadow-sm transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-8 bg-slate-50/50 flex items-center gap-3">
                <Info className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Stored locally on this device
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Preset Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {editingPreset?.id ? 'Edit Preset' : 'New Preset'}
                </h2>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 tracking-[0.2em]">Display Name</label>
                  <input
                    type="text"
                    value={tempPresetName}
                    onChange={(e) => setTempPresetName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-brand-500 focus:outline-none font-bold transition-all text-slate-900"
                    placeholder="e.g. Dopamine 600mg"
                    autoFocus
                  />
                </div>
                
                {editingPreset?.id && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 tracking-[0.2em]">Amount (mg)</label>
                      <input
                        type="number"
                        min="0"
                        value={editingPreset.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (parseFloat(val) < 0) return;
                          setEditingPreset({...editingPreset, amount: val});
                        }}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-brand-500 focus:outline-none font-bold text-sm text-slate-900"
                      />
                    </div>
                    {!editingPreset.isUndiluted && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.2em]">Volume (ml)</label>
                        <input
                          type="number"
                          min="0"
                          value={editingPreset.volume}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (parseFloat(val) < 0) return;
                            setEditingPreset({...editingPreset, volume: val});
                          }}
                          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-brand-500 focus:outline-none font-bold text-sm text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-8 bg-slate-50/50 flex gap-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 px-6 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePreset}
                  className="flex-1 py-4 px-6 bg-brand-600 rounded-2xl text-sm font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
