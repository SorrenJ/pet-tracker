import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, FileText, Stethoscope, Pill, Receipt, Search, Eye, X, Download } from 'lucide-react';
import { useApp, useActivePetData } from '../context/AppContext';
import { EmptyPet } from '../components/EmptyPet';
import { Modal } from '../components/Modal';
import type { DocCategory, HealthDocument } from '../types';

const CATEGORIES: { value: DocCategory; label: string; icon: typeof FileText; color: string; bg: string }[] = [
  { value: 'vet_record', label: 'Vet Record', icon: Stethoscope, color: 'text-rose-600', bg: 'bg-rose-50' },
  { value: 'prescription', label: 'Prescription', icon: Pill, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'billing', label: 'Billing', icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'other', label: 'Other', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
];

function getCategoryInfo(cat: DocCategory) {
  return CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[3];
}

function AddDocModal({ onClose }: { onClose: () => void }) {
  const { dispatch, activePet } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocCategory>('vet_record');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [fileType, setFileType] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileType(file.type);
    const reader = new FileReader();
    reader.onload = ev => setFileData(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activePet) return;
    dispatch({
      type: 'ADD_HEALTH_DOC',
      doc: {
        petId: activePet.id,
        name,
        category,
        date,
        notes: notes || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        fileData,
        fileType,
        fileName,
      },
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Annual checkup, Rabies vaccine..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${category === cat.value ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:border-rose-200'}`}
              >
                <Icon size={15} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>
      {category === 'billing' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Document / Scan</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-rose-300 transition-colors"
        >
          {fileData ? (
            <div className="flex items-center gap-2 justify-center text-sm text-gray-600">
              <FileText size={16} className="text-rose-500" />
              <span className="truncate max-w-[200px]">{fileName}</span>
              <button type="button" onClick={e => { e.stopPropagation(); setFileData(undefined); setFileName(undefined); setFileType(undefined); }}>
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          ) : (
            <>
              <Plus size={20} className="text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Tap to upload image, PDF, or scan</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Any additional notes..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600">Save Document</button>
      </div>
    </form>
  );
}

function DocViewer({ doc, onClose }: { doc: HealthDocument; onClose: () => void }) {
  const catInfo = getCategoryInfo(doc.category);
  const Icon = catInfo.icon;

  function handleDownload() {
    if (!doc.fileData || !doc.fileName) return;
    const a = document.createElement('a');
    a.href = doc.fileData;
    a.download = doc.fileName;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className={`${catInfo.bg} rounded-xl p-4 flex items-center gap-3`}>
        <Icon size={20} className={catInfo.color} />
        <div>
          <p className={`font-semibold ${catInfo.color}`}>{doc.name}</p>
          <p className="text-xs text-gray-400">{catInfo.label} · {format(new Date(doc.date), 'MMMM d, yyyy')}</p>
        </div>
      </div>
      {doc.amount != null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Amount</span>
          <span className="font-semibold text-gray-700">${doc.amount.toFixed(2)}</span>
        </div>
      )}
      {doc.notes && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{doc.notes}</p>
        </div>
      )}
      {doc.fileData && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Document</p>
          {doc.fileType?.startsWith('image/') ? (
            <img src={doc.fileData} alt={doc.name} className="w-full rounded-xl object-contain max-h-64 bg-gray-50" />
          ) : doc.fileType === 'application/pdf' ? (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{doc.fileName}</p>
            </div>
          ) : null}
          <button
            onClick={handleDownload}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      )}
      <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600">Close</button>
    </div>
  );
}

export function HealthPlanner() {
  const { activePet, dispatch } = useApp();
  const { healthDocuments } = useActivePetData();
  const [showAdd, setShowAdd] = useState(false);
  const [viewDoc, setViewDoc] = useState<HealthDocument | null>(null);
  const [filter, setFilter] = useState<DocCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  if (!activePet) return <EmptyPet />;

  const filtered = healthDocuments.filter(d => {
    if (filter !== 'all' && d.category !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalBilling = healthDocuments
    .filter(d => d.category === 'billing' && d.amount != null)
    .reduce((sum, d) => sum + (d.amount ?? 0), 0);

  const counts = {
    vet_record: healthDocuments.filter(d => d.category === 'vet_record').length,
    prescription: healthDocuments.filter(d => d.category === 'prescription').length,
    billing: healthDocuments.filter(d => d.category === 'billing').length,
    other: healthDocuments.filter(d => d.category === 'other').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-rose-500 text-white rounded-2xl p-5">
        <p className="text-rose-100 text-sm mb-1">Health Records</p>
        <p className="text-2xl font-bold mb-3">{healthDocuments.length} documents</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-rose-600/50 rounded-xl p-2">
            <p className="text-rose-100">Vet Records</p>
            <p className="text-white font-bold text-lg">{counts.vet_record}</p>
          </div>
          <div className="bg-rose-600/50 rounded-xl p-2">
            <p className="text-rose-100">Prescriptions</p>
            <p className="text-white font-bold text-lg">{counts.prescription}</p>
          </div>
          <div className="bg-rose-600/50 rounded-xl p-2">
            <p className="text-rose-100">Total Bills</p>
            <p className="text-white font-bold text-lg">${totalBilling.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 text-white rounded-2xl font-semibold hover:bg-rose-600 transition-colors"
      >
        <Plus size={18} />
        Add Document / Scan
      </button>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-sm"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === 'all' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
        >
          All ({healthDocuments.length})
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === cat.value ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}
          >
            {cat.label} ({counts[cat.value]})
          </button>
        ))}
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <FileText size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{search ? 'No documents match your search' : 'No documents yet'}</p>
          </div>
        ) : (
          filtered.map(doc => {
            const catInfo = getCategoryInfo(doc.category);
            const Icon = catInfo.icon;
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
              >
                <div className={`w-10 h-10 ${catInfo.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={catInfo.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-400">
                    {catInfo.label} · {format(new Date(doc.date), 'MMM d, yyyy')}
                    {doc.amount != null && ` · $${doc.amount.toFixed(2)}`}
                  </p>
                  {doc.fileName && <p className="text-xs text-gray-400 truncate">{doc.fileName}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setViewDoc(doc)}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <Eye size={15} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_HEALTH_DOC', id: doc.id })}
                    className="p-1.5 hover:bg-gray-100 rounded-full"
                  >
                    <Trash2 size={15} className="text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAdd && <Modal title="Add Health Document" onClose={() => setShowAdd(false)} size="lg"><AddDocModal onClose={() => setShowAdd(false)} /></Modal>}
      {viewDoc && <Modal title="Document Details" onClose={() => setViewDoc(null)} size="lg"><DocViewer doc={viewDoc} onClose={() => setViewDoc(null)} /></Modal>}
    </div>
  );
}
