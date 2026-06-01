'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import AIChat from '@/components/AIChat'
import { PieChart, CategoryBreakdown, CATEGORY_ICONS } from '@/components/BudgetChart'
import { getBudget, setBudget, getExpenses, addExpense, deleteExpense } from '@/lib/supabase'

const CATEGORIES = Object.keys(CATEGORY_ICONS)
const CURRENCIES = ['EUR', 'USD', 'GBP', 'TRY', 'MAD', 'THB']

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="heading-playfair text-lg mb-3">{title}</h2>
      {children}
    </div>
  )
}

export default function MeerPage() {
  const [currentUser, setCurrentUser] = useState('abdul')
  const [activeTab, setActiveTab] = useState('budget')
  const [budget, setBudgetData] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ amount: '', category: 'Eten', description: '', date: '' })
  const [budgetForm, setBudgetForm] = useState({ total_budget: '', currency: 'EUR' })
  const [darkMode, setDarkMode] = useState(false)
  const [partnerNames, setPartnerNames] = useState({ p1: 'Abdul', p2: 'Lilia' })

  useEffect(() => {
    setCurrentUser(localStorage.getItem('honeymoon_user') || 'abdul')
    setDarkMode(document.documentElement.classList.contains('dark'))
    const names = localStorage.getItem('honeymoon_names')
    if (names) { try { setPartnerNames(JSON.parse(names)) } catch {} }
  }, [])

  useEffect(() => {
    async function load() {
      const [b, e] = await Promise.all([getBudget(), getExpenses()])
      if (b) { setBudgetData(b); setBudgetForm({ total_budget: b.total_budget, currency: b.currency }) }
      setExpenses(e)
      setLoading(false)
    }
    load()
  }, [])

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleSaveBudget() {
    const data = await setBudget(Number(budgetForm.total_budget), budgetForm.currency)
    if (data) setBudgetData(data)
    setShowBudgetForm(false)
  }

  async function handleAddExpense() {
    if (!expenseForm.amount) return
    const expense = await addExpense({
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description || null,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      added_by: currentUser,
    })
    if (expense) setExpenses(prev => [expense, ...prev])
    setShowExpenseForm(false)
    setExpenseForm({ amount: '', category: 'Eten', description: '', date: '' })
  }

  async function handleDeleteExpense(id) {
    await deleteExpense(id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalBudget = budget?.total_budget || 0
  const pct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const currency = budget?.currency || 'EUR'
  const progressColor = pct < 50 ? '#4CAF50' : pct < 80 ? '#D4AF37' : '#E8A4B8'

  const TABS = [
    { key: 'budget', label: '💰 Budget' },
    { key: 'ai',     label: '✨ Assistent' },
    { key: 'instellingen', label: '⚙️ Instellingen' },
  ]

  return (
    <div className="min-h-dvh">
      <div className="page-content px-4">
        <div className="mb-4">
          <h1 className="heading-playfair text-2xl">Meer</h1>
          <p className="heading-italic text-xs mt-0.5" style={{ color: '#9B8080' }}>
            Budget, assistent & instellingen
          </p>
        </div>

        <div className="gold-line mb-4" />

        {/* Tab navigatie */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all"
                    style={{
                      background: activeTab === tab.key
                        ? 'linear-gradient(135deg, rgba(232,164,184,0.25), rgba(212,175,55,0.25))'
                        : 'rgba(212,175,55,0.08)',
                      color: activeTab === tab.key ? '#3D2B1F' : '#9B8080',
                      border: activeTab === tab.key ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                      fontFamily: 'DM Sans',
                    }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BUDGET TAB ── */}
        {activeTab === 'budget' && (
          <div>
            {/* Overzicht card */}
            <div className="glass-card p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="heading-playfair">Reisbudget</h3>
                <button onClick={() => setShowBudgetForm(true)} className="text-lg opacity-60">✏️</button>
              </div>

              {totalBudget > 0 ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Uitgegeven</span>
                    <span className="font-bold" style={{ color: progressColor }}>
                      {currency} {totalSpent.toFixed(2)} / {totalBudget.toFixed(2)}
                    </span>
                  </div>
                  <div className="progress-bar mb-2">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: progressColor }} />
                  </div>
                  <p className="text-xs text-right" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
                    Nog {currency} {Math.max(0, totalBudget - totalSpent).toFixed(2)} beschikbaar
                  </p>
                </>
              ) : (
                <p className="text-sm" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
                  Stel jullie totaalbudget in
                </p>
              )}
            </div>

            {/* Pie chart + categorieën */}
            {expenses.length > 0 && (
              <div className="glass-card p-4 mb-4">
                <div className="flex items-center gap-4">
                  <PieChart expenses={expenses} />
                  <div className="flex-1">
                    <CategoryBreakdown expenses={expenses} currency={currency} />
                  </div>
                </div>
              </div>
            )}

            {/* Uitgave toevoegen */}
            <button onClick={() => setShowExpenseForm(true)} className="btn-gold w-full py-3 mb-4">
              + Uitgave toevoegen
            </button>

            {/* Uitgaven lijst */}
            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-16" />)}
              </div>
            ) : expenses.length === 0 ? (
              <p className="text-center py-8 heading-italic" style={{ color: '#9B8080' }}>
                Nog geen uitgaven geregistreerd
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {expenses.map(expense => (
                  <div key={expense.id} className="glass-card-sm p-3 flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[expense.category] || '🎁'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm" style={{ color: '#3D2B1F', fontFamily: 'DM Sans' }}>
                          {expense.description || expense.category}
                        </p>
                        <span className="font-bold text-sm ml-2" style={{ color: '#D4AF37' }}>
                          {currency} {Number(expense.amount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
                        {expense.category} · {new Date(expense.date).toLocaleDateString('nl-NL')} · {expense.added_by === 'lilia' ? '👰' : '🤵'}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteExpense(expense.id)}
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center active:scale-90"
                            style={{ background: 'rgba(232,164,184,0.15)' }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AI TAB ── */}
        {activeTab === 'ai' && (
          <AIChat currentUser={currentUser} />
        )}

        {/* ── INSTELLINGEN TAB ── */}
        {activeTab === 'instellingen' && (
          <div className="flex flex-col gap-3">
            <div className="glass-card p-4">
              <h3 className="heading-playfair mb-3">Weergave</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{darkMode ? '🌙' : '☀️'}</span>
                  <span className="text-sm" style={{ fontFamily: 'DM Sans' }}>
                    {darkMode ? 'Nacht modus' : 'Dag modus'}
                  </span>
                </div>
                <button onClick={toggleDark}
                        className="w-12 h-6 rounded-full transition-all relative"
                        style={{ background: darkMode ? '#D4AF37' : 'rgba(212,175,55,0.2)' }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                        style={{ left: darkMode ? 26 : 2 }} />
                </button>
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="heading-playfair mb-3">Profiel wisselen</h3>
              <p className="text-sm mb-3" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>
                Je bent ingelogd als: {currentUser === 'lilia' ? '👰 Lilia' : '🤵 Abdul'}
              </p>
              <div className="flex gap-2">
                {['abdul', 'lilia'].map(name => (
                  <button key={name}
                          onClick={() => { localStorage.setItem('honeymoon_user', name); setCurrentUser(name) }}
                          className="flex-1 py-2 rounded-xl text-sm transition-all"
                          style={{
                            background: currentUser === name ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.08)',
                            color: currentUser === name ? '#D4AF37' : '#9B8080',
                            border: currentUser === name ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                            fontFamily: 'DM Sans',
                          }}>
                    {name === 'lilia' ? '👰 Lilia' : '🤵 Abdul'}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="heading-playfair mb-3">Valuta</h3>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map(c => (
                  <button key={c}
                          onClick={async () => {
                            const data = await setBudget(budget?.total_budget || 0, c)
                            if (data) setBudgetData(data)
                          }}
                          className="px-3 py-1.5 rounded-xl text-sm"
                          style={{
                            background: currency === c ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.08)',
                            color: currency === c ? '#D4AF37' : '#9B8080',
                            border: currency === c ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                            fontFamily: 'DM Sans',
                          }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="heading-playfair mb-1">App info</h3>
              <p className="text-xs heading-italic" style={{ color: '#9B8080' }}>
                Abdul &amp; Lilia Huwelijksreis App 💍<br />
                Versie 1.0 · Gemaakt met liefde ✨
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Weet je zeker dat je wilt uitloggen?')) {
                  localStorage.removeItem('honeymoon_user')
                  window.location.href = '/'
                }
              }}
              className="w-full py-3 rounded-2xl text-sm"
              style={{ background: 'rgba(232,164,184,0.1)', color: '#E8A4B8', border: '1px solid rgba(232,164,184,0.2)', fontFamily: 'DM Sans' }}>
              Uitloggen
            </button>
          </div>
        )}
      </div>

      {/* Budget formulier */}
      {showBudgetForm && (
        <div className="modal-overlay" onClick={() => setShowBudgetForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="heading-playfair text-xl mb-4">Budget instellen</h2>
            <div className="flex flex-col gap-3">
              <input type="number" placeholder="Totaal budget" value={budgetForm.total_budget}
                     onChange={e => setBudgetForm(p => ({ ...p, total_budget: e.target.value }))}
                     className="input-field" inputMode="decimal" />
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map(c => (
                  <button key={c} onClick={() => setBudgetForm(p => ({ ...p, currency: c }))}
                          className="px-3 py-1.5 rounded-xl text-sm"
                          style={{
                            background: budgetForm.currency === c ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.08)',
                            color: budgetForm.currency === c ? '#D4AF37' : '#9B8080',
                            fontFamily: 'DM Sans',
                          }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowBudgetForm(false)}
                      className="flex-1 py-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#9B8080' }}>
                Annuleer
              </button>
              <button onClick={handleSaveBudget} className="flex-1 btn-gold py-3">Opslaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Uitgave formulier */}
      {showExpenseForm && (
        <div className="modal-overlay" onClick={() => setShowExpenseForm(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="heading-playfair text-xl mb-4">Uitgave toevoegen</h2>
            <div className="flex flex-col gap-3">
              <input type="number" placeholder="Bedrag" value={expenseForm.amount}
                     onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                     className="input-field" inputMode="decimal" />
              <div>
                <label className="text-xs mb-2 block" style={{ color: '#9B8080', fontFamily: 'DM Sans' }}>Categorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setExpenseForm(p => ({ ...p, category: cat }))}
                            className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs transition-all"
                            style={{
                              background: expenseForm.category === cat ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.08)',
                              color: expenseForm.category === cat ? '#D4AF37' : '#9B8080',
                              border: `1px solid ${expenseForm.category === cat ? 'rgba(212,175,55,0.4)' : 'transparent'}`,
                              fontFamily: 'DM Sans',
                            }}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Omschrijving (optioneel)" value={expenseForm.description}
                     onChange={e => setExpenseForm(p => ({ ...p, description: e.target.value }))}
                     className="input-field" />
              <input type="date" value={expenseForm.date}
                     onChange={e => setExpenseForm(p => ({ ...p, date: e.target.value }))}
                     className="input-field" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowExpenseForm(false)}
                      className="flex-1 py-3 rounded-2xl" style={{ background: 'rgba(212,175,55,0.1)', color: '#9B8080' }}>
                Annuleer
              </button>
              <button onClick={handleAddExpense} disabled={!expenseForm.amount}
                      className="flex-1 btn-gold py-3 disabled:opacity-50">
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
