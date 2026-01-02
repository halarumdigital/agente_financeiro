import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { getCategories, createCategory, deleteCategory } from '../services/api';
import type { Category } from '../types';
import { RefreshCw, Plus, X, Trash2 } from 'lucide-react';

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280',
];

const ICONS = [
  { value: 'utensils', label: '🍽️ Alimentacao' },
  { value: 'car', label: '🚗 Transporte' },
  { value: 'home', label: '🏠 Moradia' },
  { value: 'heart', label: '❤️ Saude' },
  { value: 'graduation-cap', label: '🎓 Educacao' },
  { value: 'gamepad', label: '🎮 Lazer' },
  { value: 'shirt', label: '👕 Vestuario' },
  { value: 'file-text', label: '📄 Contas' },
  { value: 'repeat', label: '🔄 Assinaturas' },
  { value: 'briefcase', label: '💼 Trabalho' },
  { value: 'laptop', label: '💻 Tecnologia' },
  { value: 'trending-up', label: '📈 Investimentos' },
  { value: 'shopping-bag', label: '🛍️ Compras' },
  { value: 'gift', label: '🎁 Presentes' },
  { value: 'plane', label: '✈️ Viagens' },
  { value: 'circle', label: '⚪ Outros' },
];

function getIconEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    'utensils': '🍽️',
    'car': '🚗',
    'home': '🏠',
    'heart': '❤️',
    'graduation-cap': '🎓',
    'gamepad': '🎮',
    'shirt': '👕',
    'file-text': '📄',
    'repeat': '🔄',
    'briefcase': '💼',
    'laptop': '💻',
    'trending-up': '📈',
    'shopping-bag': '🛍️',
    'bar-chart-2': '📊',
    'lock': '🔒',
    'pie-chart': '🥧',
    'bitcoin': '₿',
    'building': '🏢',
    'piggy-bank': '🐷',
    'gift': '🎁',
    'plane': '✈️',
    'plus-circle': '➕',
    'more-horizontal': '📁',
    'circle': '⚪',
  };
  return iconMap[icon] || '📁';
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'investment'>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense' | 'investment',
    icon: 'circle',
    color: '#6B7280',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(formData);
      setShowForm(false);
      setFormData({ name: '', type: 'expense', icon: 'circle', color: '#6B7280' });
      fetchCategories();
    } catch (err) {
      console.error('Erro ao criar categoria:', err);
      alert('Erro ao criar categoria. Verifique se o nome ja existe.');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deseja excluir a categoria "${name}"?`)) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  if (loading) {
    return (
      <Layout title="Categorias">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Categorias">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['all', 'expense', 'income', 'investment'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'Todas' : type === 'expense' ? 'Despesas' : type === 'income' ? 'Receitas' : 'Investimentos'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nova Categoria</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Supermercado, Freelance..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <div className="flex gap-2">
                  {(['expense', 'income', 'investment'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                        formData.type === type
                          ? type === 'expense'
                            ? 'bg-red-500 text-white'
                            : type === 'income'
                            ? 'bg-green-500 text-white'
                            : 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {type === 'expense' ? 'Despesa' : type === 'income' ? 'Receita' : 'Investimento'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icone
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {ICONS.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor
                </label>
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

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: formData.color + '20' }}
                  >
                    <span className="text-2xl">{getIconEmoji(formData.icon)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {formData.name || 'Nome da categoria'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formData.type === 'expense' ? 'Despesa' : formData.type === 'income' ? 'Receita' : 'Investimento'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Criar Categoria
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: category.color + '20' }}
              >
                <span className="text-2xl">{getIconEmoji(category.icon)}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{category.name}</p>
                <p className="text-sm text-gray-400">
                  {category.type === 'expense' ? 'Despesa' : category.type === 'income' ? 'Receita' : 'Investimento'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Excluir"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
