'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShoppingCart,
  Trash2,
  Users,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Product = { code: string; name: string; category: string; price: number; current: number; minimum: number; tax: number }
type Movement = { id: number; type: 'Entrada' | 'Venda'; code: string; product: string; quantity: number; date: string }
type Client = { cpf: string; name: string; email: string }
type Employee = { code: string; name: string; role: string }

const initialProducts: Product[] = [
  { code: 'PLV-01', name: 'RTX 4060 Gaming OC', category: 'Placas de vídeo', price: 2849.9, current: 4, minimum: 3, tax: 18 },
  { code: 'CNS-05', name: 'PlayStation 5 Slim', category: 'Consoles', price: 3999.9, current: 2, minimum: 5, tax: 25 },
  { code: 'ACC-12', name: 'Headset HyperX Cloud III', category: 'Periféricos', price: 699.9, current: 18, minimum: 10, tax: 12 },
  { code: 'NBK-08', name: 'Notebook Legion 5i', category: 'Computadores', price: 7499, current: 3, minimum: 3, tax: 18 },
  { code: 'CON-21', name: 'Nintendo Switch OLED', category: 'Consoles', price: 2299.9, current: 8, minimum: 4, tax: 25 },
]

const initialMovements: Movement[] = [
  { id: 1, type: 'Entrada', code: 'ACC-12', product: 'Headset HyperX Cloud III', quantity: 10, date: '26/10/2026, 10:42' },
  { id: 2, type: 'Venda', code: 'CNS-05', product: 'PlayStation 5 Slim', quantity: 1, date: '26/10/2026, 09:18' },
]

const initialClients: Client[] = [
  { cpf: '12345678909', name: 'Ana Ferreira', email: 'ana@email.com' },
  { cpf: '98765432100', name: 'Bruno Lima', email: 'bruno@email.com' },
]
const initialEmployees: Employee[] = [
  { code: 'FUN-001', name: 'Admin', role: 'Administrador' },
  { code: 'FUN-002', name: 'Camila Souza', role: 'Estoquista' },
]

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Produtos', icon: Boxes },
  { label: 'Movimentações', icon: ArrowUpFromLine },
  { label: 'Clientes', icon: Users },
  { label: 'Funcionários', icon: UserRound },
  { label: 'Relatórios', icon: FileBarChart },
]

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const regimeRates: Record<string, number> = {
  'Simples Nacional': 6,
  'Lucro Presumido': 11.33,
  'Lucro Real': 15,
}

const regimeDescriptions: Record<string, string> = {
  'Simples Nacional': 'Alíquota estimada de 6,00% sobre o faturamento tributável.',
  'Lucro Presumido': 'Alíquota estimada de 11,33% sobre a base presumida.',
  'Lucro Real': 'Alíquota estimada de 15,00% sobre o resultado tributável.',
}

function calculateRegimeTax(value: number, selectedRegime: string) {
  return value * (regimeRates[selectedRegime] ?? regimeRates['Simples Nacional']) / 100
}

export default function Page() {
  const [page, setPage] = useState('Dashboard')
  const [products, setProducts] = useState(initialProducts)
  const [movements, setMovements] = useState(initialMovements)
  const [clients, setClients] = useState(initialClients)
  const [employees, setEmployees] = useState(initialEmployees)
  const [query, setQuery] = useState('')
  const [regime, setRegime] = useState('Simples Nacional')
  const [dialog, setDialog] = useState<'product' | 'entry' | 'sale' | 'client' | 'employee' | null>(null)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [editingCpf, setEditingCpf] = useState<string | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const filteredProducts = useMemo(() => products.filter((product) => `${product.code} ${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase())), [products, query])
  const totalValue = products.reduce((sum, product) => sum + product.price * product.current, 0)
  const totalTax = calculateRegimeTax(totalValue, regime)
  const lowStock = products.filter((product) => product.current <= product.minimum).length

  function saveProduct(form: HTMLFormElement) {
    const data = new FormData(form)
    const product: Product = { code: String(data.get('code')).trim().toUpperCase(), name: String(data.get('name')).trim(), category: String(data.get('category')).trim(), price: Number(data.get('price')), current: Number(data.get('current')), minimum: Number(data.get('minimum')), tax: Number(data.get('tax')) }
    if (!product.code || !product.name || product.price <= 0 || product.current < 0 || product.minimum < 0 || product.tax < 0 || product.tax > 100) return setNotice('Preencha os dados do produto corretamente.')
    setProducts((items) => editingCode ? items.map((item) => item.code === editingCode ? product : item) : [...items, product])
    setDialog(null); setEditingCode(null); setNotice('Produto salvo com sucesso.')
  }

  function registerMovement(form: HTMLFormElement, type: 'Entrada' | 'Venda') {
    const data = new FormData(form); const code = String(data.get('code')).trim().toUpperCase(); const quantity = Number(data.get('quantity')); const product = products.find((item) => item.code === code)
    if (!product || quantity <= 0) return setNotice('Informe um produto válido e uma quantidade maior que zero.')
    if (type === 'Venda' && quantity > product.current) return setNotice('Estoque insuficiente para esta venda.')
    setProducts((items) => items.map((item) => item.code === code ? { ...item, current: item.current + (type === 'Entrada' ? quantity : -quantity) } : item))
    setMovements((items) => [{ id: Date.now(), type, code, product: product.name, quantity, date: new Date().toLocaleString('pt-BR') }, ...items])
    setDialog(null); setNotice(`${type} registrada com sucesso.`)
  }

  function openEdit(product: Product) { setEditingCode(product.code); setDialog('product') }
  const editingProduct = products.find((product) => product.code === editingCode)

  return <main className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><WalletCards /></div><div><p className="text-sm font-bold tracking-tight">Estoque Tributável</p><p className="text-[11px] text-muted-foreground">Tech & Games</p></div></div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-6" aria-label="Navegação principal"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Menu principal</p>{navItems.map(({ label, icon: Icon }) => <Button key={label} variant={page === label ? 'secondary' : 'ghost'} onClick={() => setPage(label)} className="justify-start gap-3 px-3 text-sm font-medium"><Icon data-icon="inline-start" />{label}{label === 'Movimentações' && <Badge variant="outline" className="ml-auto text-[10px]">{movements.length}</Badge>}</Button>)}</nav>
      <div className="border-t border-sidebar-border p-4"><Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => setNotice('Configurações disponíveis em breve.')}><Settings2 data-icon="inline-start" />Configurações</Button></div>
    </aside>

    <section className="lg:pl-64"><header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8"><div><p className="text-sm text-muted-foreground">Visão geral</p><h1 className="text-xl font-semibold tracking-tight">{page}</h1></div><div className="flex items-center gap-3"><select value={regime} onChange={(event) => setRegime(event.target.value)} className="hidden h-9 rounded-lg border border-input bg-background px-3 text-sm sm:block"><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select><Separator orientation="vertical" className="hidden h-8 sm:block" /><Avatar className="size-9 border border-border"><AvatarFallback className="bg-primary/15 text-xs text-primary">AF</AvatarFallback></Avatar><div className="hidden text-right sm:block"><p className="text-xs font-semibold">Admin FUN-001</p><p className="text-[11px] text-muted-foreground">Administrador</p></div></div></header>
      <div className="mx-auto max-w-[1500px] p-5 sm:p-8">{notice && <div role="status" className="mb-5 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">{notice}<Button variant="ghost" size="icon" onClick={() => setNotice('')} aria-label="Fechar aviso"><X /></Button></div>}
        {page === 'Dashboard' && <Dashboard totalValue={totalValue} totalTax={totalTax} lowStock={lowStock} products={products} onNavigate={setPage} onNew={() => { setEditingCode(null); setDialog('product') }} />}
        {page === 'Produtos' && <Products products={filteredProducts} query={query} setQuery={setQuery} onNew={() => { setEditingCode(null); setDialog('product') }} onEdit={openEdit} onDelete={(code) => setProducts((items) => items.filter((item) => item.code !== code))} />}
        {page === 'Movimentações' && <Movements movements={movements} onEntry={() => setDialog('entry')} onSale={() => setDialog('sale')} />}
        {page === 'Clientes' && <PeoplePage kind="client" clients={clients} employees={[]} onNew={() => { setEditingCpf(null); setDialog('client') }} onEdit={(item) => { setEditingCpf(item.cpf); setDialog('client') }} onDelete={(cpf) => setClients((items) => items.filter((item) => item.cpf !== cpf))} />}
        {page === 'Funcionários' && <PeoplePage kind="employee" clients={[]} employees={employees} onNew={() => { setEditingEmployee(null); setDialog('employee') }} onEdit={(item) => { setEditingEmployee(item.code); setDialog('employee') }} onDelete={(code) => setEmployees((items) => items.filter((item) => item.code !== code))} />}
        {page === 'Relatórios' && <Reports products={products} regime={regime} />}
      </div></section>

    <ProductDialog open={dialog === 'product'} product={editingProduct} onClose={() => { setDialog(null); setEditingCode(null) }} onSave={saveProduct} />
    <MovementDialog open={dialog === 'entry'} title="Registrar entrada" description="Adicione unidades ao estoque." products={products} onClose={() => setDialog(null)} onSubmit={(form) => registerMovement(form, 'Entrada')} />
    <MovementDialog open={dialog === 'sale'} title="Registrar venda" description="Retire unidades e atualize o estoque." products={products} onClose={() => setDialog(null)} onSubmit={(form) => registerMovement(form, 'Venda')} />
    <PersonDialog open={dialog === 'client'} kind="client" item={clients.find((item) => item.cpf === editingCpf)} onClose={() => setDialog(null)} onSave={(item) => { setClients((items) => editingCpf ? items.map((current) => current.cpf === editingCpf ? item as Client : current) : [...items, item as Client]); setDialog(null); setEditingCpf(null); setNotice('Cliente salvo com sucesso.') }} />
    <PersonDialog open={dialog === 'employee'} kind="employee" item={employees.find((item) => item.code === editingEmployee)} onClose={() => setDialog(null)} onSave={(item) => { setEmployees((items) => editingEmployee ? items.map((current) => current.code === editingEmployee ? item as Employee : current) : [...items, item as Employee]); setDialog(null); setEditingEmployee(null); setNotice('Funcionário salvo com sucesso.') }} />
  </main>
}

function Dashboard({ totalValue, totalTax, lowStock, products, onNavigate, onNew }: { totalValue: number; totalTax: number; lowStock: number; products: Product[]; onNavigate: (page: string) => void; onNew: () => void }) { return <><div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">26 de outubro de 2026</p><h2 className="text-3xl font-bold tracking-tight">Olá, Admin <span className="text-muted-foreground">/</span> bom trabalho.</h2><p className="mt-2 text-sm text-muted-foreground">Acompanhe o desempenho do seu inventário em tempo real.</p></div><Button variant="outline" onClick={() => onNavigate('Movimentações')} className="w-fit gap-2"><ClipboardList data-icon="inline-start" />Ver movimentações</Button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total em Estoque" value={money(totalValue)} detail="Atualizado agora" icon={CircleDollarSign} accent="text-sky-400" /><MetricCard label="Tributos Estimados" value={money(totalTax)} detail="Baseado nas alíquotas" icon={WalletCards} accent="text-violet-400" /><MetricCard label="Alertas de Estoque Mínimo" value={`${lowStock} itens`} detail="Necessitam reposição" icon={AlertTriangle} accent="text-amber-400" warning /><MetricCard label="Total de Produtos" value={String(products.length)} detail="Itens cadastrados" icon={Boxes} accent="text-emerald-400" /></div><div className="mt-8 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Ações rápidas</h2><p className="text-sm text-muted-foreground">Gerencie o inventário sem sair do painel.</p></div><Button onClick={onNew} className="gap-2"><Plus data-icon="inline-start" />Novo produto</Button></div><Card className="mt-5"><CardContent className="grid gap-3 p-5 sm:grid-cols-3"><Button variant="outline" onClick={() => onNavigate('Produtos')} className="h-20 gap-2"><Boxes data-icon="inline-start" />Consultar produtos</Button><Button variant="outline" onClick={() => onNavigate('Movimentações')} className="h-20 gap-2"><ArrowDownToLine data-icon="inline-start" />Registrar entrada</Button><Button variant="outline" onClick={() => onNavigate('Relatórios')} className="h-20 gap-2"><FileBarChart data-icon="inline-start" />Ver relatório fiscal</Button></CardContent></Card></> }

function Products({ products, query, setQuery, onNew, onEdit, onDelete }: { products: Product[]; query: string; setQuery: (value: string) => void; onNew: () => void; onEdit: (product: Product) => void; onDelete: (code: string) => void }) { return <><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary">Catálogo</p><h2 className="text-3xl font-bold">Produtos</h2><p className="mt-2 text-sm text-muted-foreground">Controle de produtos, estoque e estimativas fiscais.</p></div><Button onClick={onNew} className="gap-2"><Plus data-icon="inline-start" />Novo produto</Button></div><Card className="overflow-hidden"><CardHeader className="border-b border-border/70 pb-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="text-base">Produtos em estoque <Badge variant="secondary" className="ml-2">{products.length}</Badge></CardTitle><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por produto ou código..." className="pl-9" />{query && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 size-7 -translate-y-1/2" onClick={() => setQuery('')} aria-label="Limpar busca"><X /></Button>}</div></div></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-6">Código / Produto</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Qtd. atual</TableHead><TableHead>Mínimo</TableHead><TableHead>Alíquota</TableHead><TableHead>Tributo estimado</TableHead><TableHead className="pr-6 text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{products.map((product) => { const low = product.current <= product.minimum; return <TableRow key={product.code} className={low ? 'bg-amber-400/[0.035]' : ''}><TableCell className="pl-6"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Boxes /></div><div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{product.code}</p></div></div></TableCell><TableCell><Badge variant="outline">{product.category}</Badge></TableCell><TableCell className="font-medium">{money(product.price)}</TableCell><TableCell><Badge variant={low ? 'destructive' : 'secondary'}>{product.current} un.</Badge></TableCell><TableCell>{product.minimum} un.</TableCell><TableCell>{product.tax}%</TableCell><TableCell>{money(product.price * product.current * product.tax / 100)}</TableCell><TableCell className="pr-6 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(product.code)} aria-label={`Excluir ${product.name}`}><Trash2 /></Button></div></TableCell></TableRow> })}</TableBody></Table></div>{products.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</p>}</CardContent></Card></> }

function Movements({ movements, onEntry, onSale }: { movements: Movement[]; onEntry: () => void; onSale: () => void }) { return <><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary">Operações</p><h2 className="text-3xl font-bold">Movimentações</h2><p className="mt-2 text-sm text-muted-foreground">Entradas e vendas atualizam o estoque imediatamente.</p></div><div className="flex gap-2"><Button variant="outline" onClick={onEntry} className="gap-2"><ArrowDownToLine data-icon="inline-start" />Entrada</Button><Button onClick={onSale} className="gap-2"><ShoppingCart data-icon="inline-start" />Venda</Button></div></div><Card><CardHeader><CardTitle className="text-base">Histórico recente</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead className="pl-6">Tipo</TableHead><TableHead>Produto</TableHead><TableHead>Código</TableHead><TableHead>Quantidade</TableHead><TableHead className="pr-6">Data</TableHead></TableRow></TableHeader><TableBody>{movements.map((movement) => <TableRow key={movement.id}><TableCell className="pl-6"><Badge variant={movement.type === 'Entrada' ? 'secondary' : 'outline'}>{movement.type}</Badge></TableCell><TableCell className="font-medium">{movement.product}</TableCell><TableCell>{movement.code}</TableCell><TableCell>{movement.quantity} un.</TableCell><TableCell className="pr-6 text-muted-foreground">{movement.date}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></> }

function Reports({ products, regime }: { products: Product[]; regime: string }) {
  const value = products.reduce((sum, product) => sum + product.price * product.current, 0)
  const rate = regimeRates[regime] ?? regimeRates['Simples Nacional']
  const tax = calculateRegimeTax(value, regime)

  return <>
    <div className="mb-6"><p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary">Fiscal</p><h2 className="text-3xl font-bold">Relatórios</h2><p className="mt-2 text-sm text-muted-foreground">Resumo tributável do estoque no regime {regime}.</p></div>
    <Card className="mb-6 border-primary/30 bg-primary/5"><CardContent className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{regime}</p><p className="text-sm text-muted-foreground">{regimeDescriptions[regime]}</p></div><Badge variant="secondary" className="w-fit">{rate.toFixed(2).replace('.', ',')}% aplicado</Badge></CardContent></Card>
    <div className="grid gap-4 md:grid-cols-3"><MetricCard label="Valor dos produtos" value={money(value)} detail="Estoque atual" icon={CircleDollarSign} accent="text-sky-400" /><MetricCard label="Tributos estimados" value={money(tax)} detail={`Alíquota do ${regime}`} icon={WalletCards} accent="text-violet-400" /><MetricCard label="Total com tributos" value={money(value + tax)} detail="Projeção" icon={FileBarChart} accent="text-emerald-400" /></div>
    <Card className="mt-6"><CardHeader><CardTitle className="text-base">Detalhamento por produto</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="pl-6">Produto</TableHead><TableHead>Valor em estoque</TableHead><TableHead>Tributo ({rate.toFixed(2).replace('.', ',')}%)</TableHead><TableHead className="pr-6">Total</TableHead></TableRow></TableHeader><TableBody>{products.map((product) => { const itemValue = product.price * product.current; const itemTax = calculateRegimeTax(itemValue, regime); return <TableRow key={product.code}><TableCell className="pl-6 font-medium">{product.name}</TableCell><TableCell>{money(itemValue)}</TableCell><TableCell>{money(itemTax)}</TableCell><TableCell className="pr-6">{money(itemValue + itemTax)}</TableCell></TableRow> })}</TableBody></Table></div></CardContent></Card>
  </>
}

function PeoplePage({ kind, clients, employees, onNew, onEdit, onDelete }: { kind: 'client' | 'employee'; clients: Client[]; employees: Employee[]; onNew: () => void; onEdit: (item: Client | Employee) => void; onDelete: (id: string) => void }) {
  const isClient = kind === 'client'
  return <><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs uppercase tracking-[0.18em] text-primary">Cadastros</p><h2 className="text-3xl font-bold">{isClient ? 'Clientes' : 'Funcionários'}</h2><p className="mt-2 text-sm text-muted-foreground">{isClient ? 'Clientes vinculados às vendas e saídas do estoque.' : 'Equipe autorizada a movimentar o estoque.'}</p></div><Button onClick={onNew} className="gap-2"><Plus data-icon="inline-start" />{isClient ? 'Novo cliente' : 'Novo funcionário'}</Button></div><Card className="overflow-hidden"><CardHeader className="border-b border-border/70"><CardTitle className="text-base">{isClient ? 'Clientes cadastrados' : 'Funcionários cadastrados'} <Badge variant="secondary" className="ml-2">{isClient ? clients.length : employees.length}</Badge></CardTitle></CardHeader><CardContent className="p-0">{isClient ? clients.map((item) => <div key={item.cpf} className="flex items-center justify-between gap-4 border-b border-border/70 px-6 py-4 last:border-0"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">CPF {item.cpf} · {item.email}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label={`Editar ${item.name}`}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(item.cpf)} aria-label={`Excluir ${item.name}`}><Trash2 /></Button></div></div>) : employees.map((item) => <div key={item.code} className="flex items-center justify-between gap-4 border-b border-border/70 px-6 py-4 last:border-0"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.code} · {item.role}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label={`Editar ${item.name}`}><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => onDelete(item.code)} aria-label={`Excluir ${item.name}`}><Trash2 /></Button></div></div>)}</CardContent></Card></>
}

function PersonDialog({ open, kind, item, onClose, onSave }: { open: boolean; kind: 'client' | 'employee'; item?: Client | Employee; onClose: () => void; onSave: (item: Client | Employee) => void }) {
  const isClient = kind === 'client'
  return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent><DialogHeader><DialogTitle>{item ? 'Editar' : 'Novo'} {isClient ? 'cliente' : 'funcionário'}</DialogTitle><DialogDescription>Preencha os dados do cadastro.</DialogDescription></DialogHeader><form id={`${kind}-form`} onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const first = String(data.get(isClient ? 'cpf' : 'code')).trim().toUpperCase(); const name = String(data.get('name')).trim(); const second = String(data.get(isClient ? 'email' : 'role')).trim(); if (!first || name.length < 2 || second.length < 2) return; onSave(isClient ? { cpf: first.replace(/\\D/g, ''), name, email: second } : { code: first, name, role: second }) }} className="flex flex-col gap-3 py-3"><Input name={isClient ? 'cpf' : 'code'} placeholder={isClient ? 'CPF com 11 números' : 'Código (ex: FUN-003)'} defaultValue={isClient ? (item as Client | undefined)?.cpf : (item as Employee | undefined)?.code} required /><Input name="name" placeholder="Nome completo" defaultValue={item?.name} required /><Input name={isClient ? 'email' : 'role'} type={isClient ? 'email' : 'text'} placeholder={isClient ? 'E-mail' : 'Cargo'} defaultValue={isClient ? (item as Client | undefined)?.email : (item as Employee | undefined)?.role} required /></form><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" form={`${kind}-form`}>Salvar cadastro</Button></DialogFooter></DialogContent></Dialog>
}

function ProductDialog({ open, product, onClose, onSave }: { open: boolean; product?: Product; onClose: () => void; onSave: (form: HTMLFormElement) => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent><DialogHeader><DialogTitle>{product ? 'Editar produto' : 'Novo produto'}</DialogTitle><DialogDescription>Preencha os dados do item do estoque.</DialogDescription></DialogHeader><form id="product-form" onSubmit={(event) => { event.preventDefault(); onSave(event.currentTarget) }} className="grid gap-3 py-3"><Input name="code" placeholder="Código (ex: PLV-01)" defaultValue={product?.code} required /><Input name="name" placeholder="Nome do produto" defaultValue={product?.name} required /><Input name="category" placeholder="Categoria" defaultValue={product?.category} required /><div className="grid grid-cols-2 gap-3"><Input name="price" type="number" step="0.01" min="0.01" placeholder="Preço" defaultValue={product?.price} required /><Input name="tax" type="number" step="0.01" min="0" max="100" placeholder="Alíquota %" defaultValue={product?.tax} required /></div><div className="grid grid-cols-2 gap-3"><Input name="current" type="number" min="0" placeholder="Estoque atual" defaultValue={product?.current ?? 0} required /><Input name="minimum" type="number" min="0" placeholder="Estoque mínimo" defaultValue={product?.minimum ?? 0} required /></div></form><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" form="product-form">Salvar produto</Button></DialogFooter></DialogContent></Dialog> }

function MovementDialog({ open, title, description, products, onClose, onSubmit }: { open: boolean; title: string; description: string; products: Product[]; onClose: () => void; onSubmit: (form: HTMLFormElement) => void }) { return <Dialog open={open} onOpenChange={(value) => !value && onClose()}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><form id={`${title}-form`} onSubmit={(event) => { event.preventDefault(); onSubmit(event.currentTarget) }} className="grid gap-3 py-3"><select name="code" required className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione o produto</option>{products.map((product) => <option key={product.code} value={product.code}>{product.code} — {product.name}</option>)}</select><Input name="quantity" type="number" min="1" placeholder="Quantidade" required /></form><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" form={`${title}-form`}>Confirmar</Button></DialogFooter></DialogContent></Dialog> }

function MetricCard({ label, value, detail, icon: Icon, accent, warning = false }: { label: string; value: string; detail: string; icon: typeof Users; accent: string; warning?: boolean }) { return <Card><CardContent className="flex items-start justify-between p-5"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-bold tracking-tight">{value}</p><p className={`mt-2 text-xs ${warning ? 'text-amber-400' : 'text-muted-foreground'}`}>{detail}</p></div><div className={`rounded-xl bg-muted p-2.5 ${accent}`}><Icon /></div></CardContent></Card> }
