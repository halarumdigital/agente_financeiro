import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import {
  getSavingsBoxes,
  getSavingsBox,
  createSavingsBox,
  depositToSavingsBox,
  withdrawFromSavingsBox,
  deleteSavingsBox,
} from '../services/api';
import type { SavingsBox, SavingsBoxTransaction } from '../types';
import { RefreshCw, Plus, X, Trash2, ArrowDownCircle, ArrowUpCircle, PiggyBank, Target } from 'lucide-react';

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280',
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function SavingsBoxes() {
  const [boxes, setBoxes] = useState<SavingsBox[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState<{ box: SavingsBox; type: 'deposit' | 'withdraw' } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<{ box: SavingsBox; transactions: SavingsBoxTransaction[] } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_amount: '',
    color: '#22C55E',
  });
  const [transactionData, setTransactionData] = useState({
    amount: '',
    description: '',
  });

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const data = await getSavingsBoxes();
      setBoxes(data.boxes);
      setTotal(data.total);
    } catch (err) {
      console.error('Erro ao carregar caixinhas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSavingsBox({
        name: formData.name.toUpperCase(),
        description: formData.description || undefined,
        goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : undefined,
        color: formData.color,
      });
      setShowCreateForm(false);
      setFormData({ name: '', description: '', goal_amount: '', color: '#22C55E' });
      fetchBoxes();
    } catch (err: any) {
      console.error('Erro ao criar caixinha:', err);
      alert(err.message || 'Erro ao criar caixinha');
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTransactionModal) return;

    try {
      const amount = parseFloat(transactionData.amount);
      if (showTransactionModal.type === 'deposit') {
        await depositToSavingsBox(showTransactionModal.box.id, amount, transactionData.description || undefined);
      } else {
        await withdrawFromSavingsBox(showTransactionModal.box.id, amount, transactionData.description || undefined);
      }
      setShowTransactionModal(null);
      setTransactionData({ amount: '', description: '' });
      fetchBoxes();
    } catch (err: any) {
      console.error('Erro na transacao:', err);
      alert(err.message || 'Erro na transacao');
    }
  };

  const handleShowDetails = async (box: SavingsBox) => {
    try {
      const data = await getSavingsBox(box.id);
      setShowDetailsModal({ box: data.box, transactions: data.transactions });
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
    }
  };

  const handleDelete = async (box: SavingsBox) => {
    if (!confirm(`Deseja excluir a caixinha "${box.name}"? O saldo sera perdido.`)) return;
    try {
      await deleteSavingsBox(box.id);
      fetchBoxes();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  if (loading) {
    return (
      <Layout title="Caixinhas">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Caixinhas">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Guardado</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(total)}</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Caixinha
        </button>
      </div>

      {/* Lista de caixinhas */}
      {boxes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma caixinha ainda</h3>
          <p className="text-gray-400 mb-4">Crie sua primeira caixinha para comecar a guardar dinheiro!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Criar Caixinha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boxes.map((box) => {
            const progress = box.goal_amount > 0 ? Math.min((Number(box.current_amount) / Number(box.goal_amount)) * 100, 100) : 0;
            const boxColor = box.color || '#22C55E';

            return (
              <div
                key={box.id}
                className="bg-white rounded-xl p-5 border border-gray-100 group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: boxColor + '20' }}
                    >
                      <PiggyBank className="w-6 h-6" style={{ color: boxColor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{box.name}</h3>
                      {box.description && (
                        <p className="text-sm text-gray-400">{box.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(box)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(Number(box.current_amount))}</p>
                  {box.goal_amount > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Meta: {formatCurrency(Number(box.goal_amount))}
                        </span>
                        <span className="font-medium" style={{ color: boxColor }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: boxColor }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTransactionModal({ box, type: 'deposit' })}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => setShowTransactionModal({ box, type: 'withdraw' })}
                    className="flex-1 flex items-center justify-center gap-1 bg-orange-100 text-orange-700 py-2 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                    disabled={Number(box.current_amount) === 0}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Retirar
                  </button>
                </div>

                <button
                  onClick={() => handleShowDetails(box)}
                  className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-1"
                >
                  Ver historico
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar caixinha */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nova Caixinha</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: VIAGEM, CARRO, EMERGENCIA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao (opcional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Para que serve essa caixinha?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta (opcional)</label>
                <input
                  type="number"
                  value={formData.goal_amount}
                  onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 10000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Criar Caixinha
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal depositar/retirar */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {showTransactionModal.type === 'deposit' ? 'Guardar na' : 'Retirar da'} {showTransactionModal.box.name}
              </h2>
              <button onClick={() => setShowTransactionModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Saldo atual: {formatCurrency(Number(showTransactionModal.box.current_amount))}
            </p>

            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <input
                  type="number"
                  required
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0,00"
                  min="0.01"
                  step="0.01"
                  max={showTransactionModal.type === 'withdraw' ? Number(showTransactionModal.box.current_amount) : undefined}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao (opcional)</label>
                <input
                  type="text"
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Motivo da movimentacao"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  showTransactionModal.type === 'deposit'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {showTransactionModal.type === 'deposit' ? 'Guardar' : 'Retirar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalhes/historico */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Historico - {showDetailsModal.box.name}</h2>
              <button onClick={() => setShowDetailsModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Saldo atual</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(Number(showDetailsModal.box.current_amount))}</p>
            </div>

            {showDetailsModal.transactions.length === 0 ? (
              <p className="text-center text-gray-400 py-4">Nenhuma movimentacao ainda</p>
            ) : (
              <div className="space-y-2">
                {showDetailsModal.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {t.type === 'deposit' ? (
                        <ArrowDownCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-orange-500" />
                      )}
                      <div>
                        <p className="text-sm text-gray-600">{t.description || (t.type === 'deposit' ? 'Deposito' : 'Retirada')}</p>
                        <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                      </div>
                    </div>
                    <p className={`font-medium ${t.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                      {t.type === 'deposit' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
