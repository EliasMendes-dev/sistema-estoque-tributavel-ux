import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Product = { code: string; name: string; category: string; price: number; current: number; minimum: number; tax: number };
type Movement = { type: 'Entrada' | 'Venda'; code: string; product: string; quantity: number; date: string };

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="brand"><div class="brand-mark">ET</div><div class="brand-copy"><strong>Estoque Tributável</strong><small>Tech & Games</small></div><button class="collapse-toggle" (click)="sidebarCollapsed = !sidebarCollapsed" [attr.aria-label]="sidebarCollapsed ? 'Expandir menu' : 'Minimizar menu'" [attr.title]="sidebarCollapsed ? 'Expandir menu' : 'Minimizar menu'"><span>{{ sidebarCollapsed ? '→' : '←' }}</span></button></div>
        <nav aria-label="Navegação principal"><label>Menu principal</label>
          <button *ngFor="let item of nav" [class.active]="page === item" (click)="page = item" [attr.title]="sidebarCollapsed ? item : null"><span class="nav-icon">{{ icon(item) }}</span><span class="nav-label">{{ item }}</span><b class="count" *ngIf="item === 'Movimentações'">{{ movements.length }}</b></button>
        </nav>
      </aside>
      <section class="main">
        <header><div><p>Visão geral</p><h1>{{ page }}</h1></div><div class="header-actions"><select [(ngModel)]="regime"><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select><div class="avatar">AF</div><div class="user"><strong>Admin FUN-001</strong><small>Administrador</small></div></div></header>
        <main class="content">
          <div class="notice" *ngIf="notice" role="status">{{ notice }} <button (click)="notice = ''" aria-label="Fechar aviso">×</button></div>
          <ng-container [ngSwitch]="page">
            <section *ngSwitchCase="'Dashboard'"><div class="topline"><div><p class="eyebrow">26 de outubro de 2026</p><h2>Olá, Admin <span class="subtle">/</span> bom trabalho.</h2><p class="intro">Acompanhe o desempenho do seu inventário em tempo real.</p></div><button class="btn outline" (click)="page='Movimentações'">Ver movimentações</button></div><div class="cards"><article class="card metric"><div class="metric-label">Total em Estoque <span class="metric-icon">◈</span></div><div class="metric-value">{{ totalValue | currency:'BRL' }}</div><div class="metric-detail">Atualizado agora</div></article><article class="card metric"><div class="metric-label">Tributos Estimados <span class="metric-icon">▣</span></div><div class="metric-value">{{ totalTax | currency:'BRL' }}</div><div class="metric-detail">Baseado nas alíquotas</div></article><article class="card metric"><div class="metric-label">Alertas de Estoque Mínimo <span class="metric-icon">△</span></div><div class="metric-value">{{ lowStock }} itens</div><div class="metric-detail">Necessitam reposição</div></article><article class="card metric"><div class="metric-label">Total de Produtos <span class="metric-icon">▦</span></div><div class="metric-value">{{ products.length }}</div><div class="metric-detail">Itens cadastrados</div></article></div><div class="section-head"><div><h3>Ações rápidas</h3><p>Gerencie o inventário sem sair do painel.</p></div><button class="btn" (click)="addProduct()">+ Novo produto</button></div><div class="card quick"><button (click)="page='Produtos'"><strong>Consultar produtos</strong><span>Veja o catálogo completo</span></button><button (click)="page='Movimentações'"><strong>Registrar movimentação</strong><span>Entrada ou venda de itens</span></button><button (click)="page='Relatórios'"><strong>Ver relatório fiscal</strong><span>Analise os tributos estimados</span></button></div></section>
            <section *ngSwitchCase="'Produtos'"><div class="topline"><div><p class="eyebrow">Catálogo</p><h2>Produtos</h2><p class="intro">Controle de produtos, estoque e estimativas fiscais.</p></div><button class="btn" (click)="addProduct()">+ Novo produto</button></div><div class="card table-card"><div class="table-head"><h3>Produtos em estoque <span class="tag">{{ filteredProducts.length }}</span></h3><input class="search" [(ngModel)]="query" placeholder="Buscar por produto ou código..." aria-label="Buscar produto"></div><table><thead><tr><th>Código / Produto</th><th>Categoria</th><th>Preço</th><th>Qtd. atual</th><th>Mínimo</th><th>Alíquota</th></tr></thead><tbody><tr *ngFor="let p of filteredProducts"><td><strong>{{ p.code }}</strong><br><span class="subtle">{{ p.name }}</span></td><td>{{ p.category }}</td><td>{{ p.price | currency:'BRL' }}</td><td><span [class]="p.current <= p.minimum ? 'tag warn' : 'tag'">{{ p.current }} un.</span></td><td>{{ p.minimum }}</td><td>{{ p.tax }}%</td></tr></tbody></table><div class="empty" *ngIf="!filteredProducts.length">Nenhum produto encontrado.</div></div></section>
            <section *ngSwitchCase="'Movimentações'"><div class="topline"><div><p class="eyebrow">Operações</p><h2>Movimentações</h2><p class="intro">Entradas e vendas atualizam o estoque imediatamente.</p></div><div><button class="btn outline" (click)="register('Entrada')">Entrada</button> <button class="btn" (click)="register('Venda')">Venda</button></div></div><div class="card table-card"><div class="table-head"><h3>Histórico recente</h3></div><table><thead><tr><th>Tipo</th><th>Produto</th><th>Código</th><th>Quantidade</th><th>Data</th></tr></thead><tbody><tr *ngFor="let m of movements"><td><span class="tag">{{ m.type }}</span></td><td><strong>{{ m.product }}</strong></td><td>{{ m.code }}</td><td>{{ m.quantity }} un.</td><td class="subtle">{{ m.date }}</td></tr></tbody></table></div></section>
            <section *ngSwitchCase="'Clientes'"><div class="topline"><div><p class="eyebrow">Relacionamento</p><h2>Clientes</h2><p class="intro">Cadastre e consulte seus clientes.</p></div><button class="btn" (click)="notice='Cliente salvo com sucesso.'">+ Novo cliente</button></div><div class="card empty">Área de clientes pronta para receber novos cadastros.</div></section>
            <section *ngSwitchCase="'Funcionários'"><div class="topline"><div><p class="eyebrow">Equipe</p><h2>Funcionários</h2><p class="intro">Gerencie os acessos da equipe.</p></div><button class="btn" (click)="notice='Funcionário salvo com sucesso.'">+ Novo funcionário</button></div><div class="card empty">Admin · Administrador<br><span class="subtle">Camila Souza · Estoquista</span></div></section>
            <section *ngSwitchCase="'Relatórios'"><div class="topline"><div><p class="eyebrow">Fiscal</p><h2>Relatórios</h2><p class="intro">Resumo tributável do estoque no regime {{ regime }}.</p></div></div><div class="card metric"><div class="metric-label">Regime atual</div><div class="metric-value">{{ regime }}</div><div class="metric-detail">Alíquota estimada: {{ rate }}%</div></div><div class="cards" style="margin-top:16px"><article class="card metric"><div class="metric-label">Valor dos produtos</div><div class="metric-value">{{ totalValue | currency:'BRL' }}</div></article><article class="card metric"><div class="metric-label">Tributos estimados</div><div class="metric-value">{{ totalTax | currency:'BRL' }}</div></article><article class="card metric"><div class="metric-label">Total com tributos</div><div class="metric-value">{{ totalValue + totalTax | currency:'BRL' }}</div></article></div></section>
          </ng-container>
        </main>
      </section>
    </div>
  `
})
export class AppComponent {
  page = 'Dashboard'; query = ''; regime = 'Simples Nacional'; notice = ''; sidebarCollapsed = false;
  nav = ['Dashboard', 'Produtos', 'Movimentações', 'Clientes', 'Funcionários', 'Relatórios'];
  products: Product[] = [
    { code:'PLV-01', name:'RTX 4060 Gaming OC', category:'Placas de vídeo', price:2849.90, current:4, minimum:3, tax:18 }, { code:'CNS-05', name:'PlayStation 5 Slim', category:'Consoles', price:3999.90, current:2, minimum:5, tax:25 }, { code:'ACC-12', name:'Headset HyperX Cloud III', category:'Periféricos', price:699.90, current:18, minimum:10, tax:12 }, { code:'NBK-08', name:'Notebook Legion 5i', category:'Computadores', price:7499, current:3, minimum:3, tax:18 }, { code:'CON-21', name:'Nintendo Switch OLED', category:'Consoles', price:2299.90, current:8, minimum:4, tax:25 }
  ];
  movements: Movement[] = [{ type:'Entrada', code:'ACC-12', product:'Headset HyperX Cloud III', quantity:10, date:'26/10/2026, 10:42' }, { type:'Venda', code:'CNS-05', product:'PlayStation 5 Slim', quantity:1, date:'26/10/2026, 09:18' }];
  get filteredProducts() { const q = this.query.toLowerCase(); return this.products.filter(p => `${p.code} ${p.name} ${p.category}`.toLowerCase().includes(q)); }
  get totalValue() { return this.products.reduce((sum, p) => sum + p.price * p.current, 0); }
  get rate() { return this.regime === 'Lucro Presumido' ? 11.33 : this.regime === 'Lucro Real' ? 15 : 6; }
  get totalTax() { return this.totalValue * this.rate / 100; }
  get lowStock() { return this.products.filter(p => p.current <= p.minimum).length; }
  icon(item: string) { return ({Dashboard:'⌂', Produtos:'▦', Movimentações:'↕', Clientes:'♙', Funcionários:'♟', Relatórios:'▤'} as Record<string,string>)[item]; }
  addProduct() { this.notice = 'Formulário de produto disponível nesta versão Angular.'; }
  register(type: 'Entrada'|'Venda') { this.notice = `${type} registrada com sucesso.`; }
}
