import { Language, TabKey } from '../types';

export interface Translations {
  settings: {
    modalTitle: string;
    modalSubtitle: string;
    languageSection: string;
    languageDescription: string;
    currencySection: string;
    currencyDescription: string;
    navSection: string;
    navDescription: string;
    activeMenuCount: (active: number, total: number) => string;
    enableAll: string;
    showAll: string;
    done: string;
    close: string;
    hiddenBadge: string;
    noDataLossTitle: string;
    noDataLossDesc: string;
    onlyOneActiveWarning: string;
  };
  navigation: {
    settingsBtn: string;
    settingsTooltip: string;
    exportBtn: string;
    importBtn: string;
    fullscreen: string;
    exitFullscreen: string;
    backupStatus: string;
    tabletView: string;
    autoMode: string;
    portraitMode: string;
    landscapeMode: string;
    tabs: Record<TabKey, {
      label: string;
      description: string;
      badge?: string;
    }>;
  };
  tabHeadings: Record<TabKey, {
    title: string;
    subtitle: string;
  }>;
  topBar: {
    monthlyIncome: string;
    fixedExpenses: string;
    freeSavingsRate: string;
    remainingDebt: string;
    monthlyPayment: string;
    paidOff: string;
    selectedCount: string;
    fullscreenTooltip: string;
    exitFullscreenTooltip: string;
  };
  cockpit: {
    personalOverview: string;
    finanzCockpit: string;
    monthlyBudget: string;
    savingsRateQuote: string;
    afterAllFix: string;
    monthlyIncome: string;
    fixedExpenses: string;
    savingsRate: string;
    budgetAllocation: string;
    shareOfIncome: (amount: string) => string;
    fixedShareLabel: (pct: string) => string;
    savingsShareLabel: (pct: string) => string;
    debtSectionTitle: string;
    debtSectionSubtitle: string;
    totalDebt: string;
    paidOff: string;
    ratenkredite: string;
    ratenkrediteSubtitle: string;
    immobilien: string;
    immobilienSubtitle: string;
    openCreditsBtn: string;
    monthlyRateShort: string;
    viewAll: string;
    viewBudget: string;
    viewCredits: string;
  };
  krediteTab: {
    repaymentProgress: string;
    currentRestDebt: string;
    activeCount: (active: number, total: number) => string;
    monthlyPayment: string;
    paid: string;
    paidPercentBadge: (pct: string) => string;
    original: string;
    totalInterest: string;
    selectAll: string;
    deselectAll: string;
    selectionHint: (active: number, total: number) => string;
    addCredit: string;
    editCredit: string;
    categoryLabel: string;
    categoryRaten: string;
    categoryImmo: string;
    tabAll: string;
    tabRaten: string;
    tabImmo: string;
    noBank: string;
    modalTitleEdit: string;
    modalTitleNew: string;
    purposeLabel: string;
    instituteLabel: string;
    loanCategoryLabel: string;
    originalAmountLabel: string;
    totalDebtLabel: string;
    interestRateLabel: string;
    remainingDebtLabel: string;
    monthlyRateLabel: string;
    portalLinkLabel: string;
    cancel: string;
    save: string;
    delete: string;
  };
  fixTab: {
    distributionTitle: string;
    expenseDistributionTitle: string;
    incomeDistributionTitle: string;
    incomeGroup: string;
    activeCount: (active: number, total: number) => string;
    totalPerMonth: string;
    category: string;
    share: string;
    amount: string;
    allDeselected: string;
    clickToSelectHint: string;
    deselectedBadge: string;
    fixedExpensesSection: string;
    categoriesCount: (count: number) => string;
    dragDropHint: string;
    addCategory: string;
    addItem: string;
    incomeSection: string;
    incomeSectionSubtitle: string;
    addIncomeGroup: string;
    commercialScope: string;
    privateScope: string;
    taxDeductible: string;
    confirmDeleteCat: string;
    selectedTotalExpenses: string;
    selectedTotalIncome: string;
    activeBadge: string;
    noActiveCategories: string;
    activateCategoriesHint: string;
    categoryDistributionShare: string;
    categoryClickToToggle: string;
  };
  common: {
    active: string;
    inactive: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirm: string;
    yes: string;
    no: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  de: {
    settings: {
      modalTitle: 'Einstellungen',
      modalSubtitle: 'Sprache und Menüpunkte verwalten. Deine Daten bleiben stets erhalten.',
      languageSection: 'Sprache / Language / Dil',
      languageDescription: 'Wähle deine bevorzugte Sprache für die Benutzeroberfläche aus.',
      currencySection: 'Währung',
      currencyDescription: 'Wähle deine bevorzugte Währung für alle Beträge, Tabellen und Auswertungen aus.',
      navSection: 'Menü & Navigation',
      navDescription: 'Punkte ein- oder ausblenden. Ausgeblendete Bereiche behalten alle Daten unverändert bei.',
      activeMenuCount: (active, total) => `${active} von ${total} Menüpunkten aktiv`,
      enableAll: 'Alle aktivieren',
      showAll: 'Alle einblenden',
      done: 'Fertig',
      close: 'Schließen',
      hiddenBadge: 'Ausgeblendet',
      noDataLossTitle: 'Kein Datenverlust:',
      noDataLossDesc: 'Ausgeblendete Menüpunkte behalten alle hinterlegten Daten (Einnahmen, Kredite, Zählerstände etc.) unverändert bei. Nach erneutem Aktivieren ist alles sofort wieder da.',
      onlyOneActiveWarning: 'Mindestens ein Menüpunkt muss aktiv bleiben',
    },
    navigation: {
      settingsBtn: 'Einstellungen',
      settingsTooltip: 'Einstellungen (Sprache & Menüpunkte)',
      exportBtn: 'Backup',
      importBtn: 'Import',
      fullscreen: 'Vollbild',
      exitFullscreen: 'Vollbild beenden',
      backupStatus: 'Lokal & persistent gesichert',
      tabletView: 'Tablet Ansicht',
      autoMode: 'Auto',
      portraitMode: 'Hoch',
      landscapeMode: 'Quer',
      tabs: {
        cockpit: {
          label: 'Cockpit',
          description: 'Persönlicher Finanz-Überblick, Liquidität & Schnellzugriff',
        },
        finanzen: {
          label: 'Finanzen',
          description: 'Monatliche Einnahmen, fixe Ausgaben & Kategorie-Verteilung',
        },
        fix: {
          label: 'Finanzen',
          description: 'Persönlicher Finanz-Überblick, Monatsbudget, Einnahmen & Fixkosten',
        },
        kredite: {
          label: 'Kredite',
          description: 'Darlehensübersicht, Tilgung, Restschuld & Zinsen',
        },
        energie: {
          label: 'Energie',
          description: 'Strom- & Gasverträge, Zählerstände, Verbrauchshistorie',
        },
        lohn: {
          label: 'Gehalt',
          description: 'Historische Brutto- & Nettoentwicklung seit Berufsstart',
        },
        konten: {
          label: 'Notfall',
          description: 'Bankzugänge, Broker-Links & Notfall-Leitfaden',
        },
        portfolio: {
          label: 'Portfolio',
          description: 'Aktien, Kryptowährungen, Live-Kurse & Performance-Tracking',
        },
      },
    },
    tabHeadings: {
      cockpit: {
        title: 'Finanz-Cockpit',
        subtitle: 'Zentraler Gesamtüberblick über Finanzen, Kredite, Energie und Konten.',
      },
      finanzen: {
        title: 'Finanzen & Cashflow',
        subtitle: 'Monatliche Einnahmen, fixe Ausgaben & detaillierte Kategorie-Auswertung.',
      },
      fix: {
        title: 'Finanzen & Cashflow',
        subtitle: 'Persönlicher Finanz-Überblick, Monatsbudget, Einnahmen und fixe Ausgaben im Detail.',
      },
      kredite: {
        title: 'Kredite & Verbindlichkeiten',
        subtitle: 'Darlehenskosten, Zinssätze, Restschuldverlauf und Direktlinks zu Kreditinstituten.',
      },
      energie: {
        title: 'Energiecenter',
        subtitle: 'Zählernummern, Vertragskonditionen, Preisgarantien und Verbrauchshistorie.',
      },
      lohn: {
        title: 'Gehalts- & Karriereentwicklung',
        subtitle: 'Historische Netto- und Brutto-Entwicklung mit prozentualer Steigerung und Meilensteinen.',
      },
      konten: {
        title: 'Notfall-Zugänge & Konten',
        subtitle: 'Zentrale Wegweiser-Übersicht für Banken, Broker und Notfall-Anweisungen.',
      },
      portfolio: {
        title: 'Aktien & Krypto Portfolio',
        subtitle: 'Bestandsverwaltung, automatische Kursupdates, Gewinn- und Verlustanalyse.',
      },
    },
    topBar: {
      monthlyIncome: 'Einnahmen',
      fixedExpenses: 'Fixkosten',
      freeSavingsRate: 'Sparrate',
      remainingDebt: 'Restschuld',
      monthlyPayment: 'Abtrag / Monat',
      paidOff: 'Getilgt',
      selectedCount: 'Gewählt',
      fullscreenTooltip: 'Vollbild',
      exitFullscreenTooltip: 'Vollbild beenden',
    },
    cockpit: {
      personalOverview: 'Persönlicher Finanz-Überblick',
      finanzCockpit: 'Budget-Cockpit',
      monthlyBudget: 'Verfügbares Monatsbudget',
      savingsRateQuote: 'Sparquote',
      afterAllFix: 'nach allen monatlichen Fixkosten',
      monthlyIncome: 'Einnahmen',
      fixedExpenses: 'Fixkosten',
      savingsRate: 'Sparrate',
      budgetAllocation: 'Budget-Aufteilung',
      shareOfIncome: (amount) => `100 % der Gesamteinnahmen (${amount})`,
      fixedShareLabel: (pct) => `Fixkosten (${pct}%)`,
      savingsShareLabel: (pct) => `Sparrate (${pct}%)`,
      debtSectionTitle: 'Restschuld & Verbindlichkeiten',
      debtSectionSubtitle: 'Tilgungsstand & Darlehensübersicht direkt im Cockpit',
      totalDebt: 'Gesamte Restschuld',
      paidOff: 'Getilgt',
      ratenkredite: 'Ratenkredite',
      ratenkrediteSubtitle: 'Kurz- & Mittelläufer (z.B. Kfz, Anschaffungen)',
      immobilien: 'Immobilienkredite',
      immobilienSubtitle: 'Langläufer / Baufinanzierung',
      openCreditsBtn: 'Kredite & Tilgungsplan öffnen',
      monthlyRateShort: 'Abtrag',
      viewAll: 'Gesamtübersicht',
      viewBudget: 'Budget',
      viewCredits: 'Kredite',
    },
    krediteTab: {
      repaymentProgress: 'Tilgungsfortschritt der gewählten Kredite',
      currentRestDebt: 'aktuelle Restschuld',
      activeCount: (active, total) => `${active} von ${total} aktiv`,
      monthlyPayment: 'Monatlicher Abtrag',
      paid: 'Getilgt',
      paidPercentBadge: (pct) => `${pct}% Getilgt`,
      original: 'Ursprünglich',
      totalInterest: 'Zinsen Gesamt',
      selectAll: 'Alle anwählen',
      deselectAll: 'Alle abwählen',
      selectionHint: (active, total) => `(${active} von ${total} Krediten für Berechnung ausgewählt)`,
      addCredit: 'Kredit hinzufügen',
      editCredit: 'Kredit bearbeiten',
      categoryLabel: 'Kategorie',
      categoryRaten: 'Ratenkredite',
      categoryImmo: 'Immobilienkredite',
      tabAll: 'Alle Kredite',
      tabRaten: 'Ratenkredite',
      tabImmo: 'Immobilienkredite',
      noBank: 'Keine Bank hinterlegt',
      modalTitleEdit: 'Kredit bearbeiten',
      modalTitleNew: 'Neuen Kredit anlegen',
      purposeLabel: 'Bezeichnung / Verwendungszweck',
      instituteLabel: 'Bank / Kreditinstitut',
      loanCategoryLabel: 'Kreditkategorie',
      originalAmountLabel: 'Nettodarlehen (Auszahlung)',
      totalDebtLabel: 'Gesamtbetrag (inkl. Zinsen & Gebühren)',
      interestRateLabel: 'Zinssatz (% p.a.)',
      remainingDebtLabel: 'Aktuelle Restschuld',
      monthlyRateLabel: 'Monatliche Rate (Abtrag)',
      portalLinkLabel: 'Online-Portal Link',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Kredit löschen',
    },
    fixTab: {
      distributionTitle: 'Ausgabenverteilung',
      expenseDistributionTitle: 'Ausgabenverteilung',
      incomeDistributionTitle: 'Einnahmenverteilung',
      incomeGroup: 'Einnahmen-Gruppe',
      activeCount: (active, total) => `${active} von ${total} aktiv`,
      totalPerMonth: 'Monat',
      category: 'Kategorie',
      share: 'Anteil',
      amount: 'Betrag',
      allDeselected: 'Alle Kategorien abgewählt',
      clickToSelectHint: 'Klicke auf eine Kategorie, um sie im Diagramm zu aktivieren.',
      deselectedBadge: 'Abgewählt',
      fixedExpensesSection: 'Fixe Ausgaben',
      categoriesCount: (count) => `${count} Kategorien`,
      dragDropHint: 'Posten per Drag & Drop sortieren und zwischen Kategorien verschieben',
      addCategory: 'Kategorie hinzufügen',
      addItem: 'Posten hinzufügen',
      incomeSection: 'Einnahmen',
      incomeSectionSubtitle: 'Gehalt, Kindergeld, Mieteinnahmen und Nebeneinkünfte',
      addIncomeGroup: 'Einnahmen-Gruppe hinzufügen',
      commercialScope: 'Geschäftlich',
      privateScope: 'Privat',
      taxDeductible: 'Steuerlich absetzbar',
      confirmDeleteCat: 'Möchtest du diese Kategorie und alle enthaltenen Posten wirklich löschen?',
      selectedTotalExpenses: 'Ausgewählte Ausgaben',
      selectedTotalIncome: 'Ausgewählte Einnahmen',
      activeBadge: 'aktiv',
      noActiveCategories: 'Keine aktiven Kategorien',
      activateCategoriesHint: 'Aktiviere Kategorien, um sie im Diagramm anzuzeigen.',
      categoryDistributionShare: 'Kategorien & Anteile',
      categoryClickToToggle: 'Klicken zum Ein-/Ausblenden im Diagramm',
    },
    common: {
      active: 'Aktiv',
      inactive: 'Inaktiv',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      yes: 'Ja',
      no: 'Nein',
    },
  },
  en: {
    settings: {
      modalTitle: 'Settings',
      modalSubtitle: 'Manage language and menu navigation. Your data is always safely retained.',
      languageSection: 'Language / Sprache / Dil',
      languageDescription: 'Choose your preferred language for the interface.',
      currencySection: 'Currency',
      currencyDescription: 'Choose your preferred currency for all amounts, tables, and reports.',
      navSection: 'Menu & Navigation',
      navDescription: 'Show or hide menu items. Hidden modules preserve all your inputs and records.',
      activeMenuCount: (active, total) => `${active} of ${total} menu items active`,
      enableAll: 'Enable all',
      showAll: 'Show all',
      done: 'Done',
      close: 'Close',
      hiddenBadge: 'Hidden',
      noDataLossTitle: 'No data loss:',
      noDataLossDesc: 'Hidden menu items retain all stored data (income, loans, meter readings, etc.). Re-enabling a section restores everything immediately.',
      onlyOneActiveWarning: 'At least one menu item must remain active',
    },
    navigation: {
      settingsBtn: 'Settings',
      settingsTooltip: 'Settings (Language & Menu items)',
      exportBtn: 'Backup',
      importBtn: 'Import',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
      backupStatus: 'Saved locally & persistently',
      tabletView: 'Tablet View',
      autoMode: 'Auto',
      portraitMode: 'Portrait',
      landscapeMode: 'Landscape',
      tabs: {
        cockpit: {
          label: 'Cockpit',
          description: 'Personal financial overview, wealth status & quick access',
        },
        finanzen: {
          label: 'Finances',
          description: 'Monthly income, fixed expenses & category distribution',
        },
        fix: {
          label: 'Finances',
          description: 'Personal financial overview, monthly budget, income & fixed costs',
        },
        kredite: {
          label: 'Loans',
          description: 'Loan overview, monthly payment, remaining debt & interest',
        },
        energie: {
          label: 'Energy',
          description: 'Electricity & gas contracts, meter readings, consumption history',
        },
        lohn: {
          label: 'Salary',
          description: 'Historical gross & net salary progression since career start',
        },
        konten: {
          label: 'Emergency',
          description: 'Banking portals, broker links & emergency guide',
        },
        portfolio: {
          label: 'Portfolio',
          description: 'Stocks, cryptocurrencies, live prices & performance tracking',
        },
      },
    },
    tabHeadings: {
      cockpit: {
        title: 'Financial Cockpit',
        subtitle: 'Central high-level overview of budget, loans, energy, and emergency accounts.',
      },
      finanzen: {
        title: 'Finances & Cashflow',
        subtitle: 'Monthly income, fixed expenses & category breakdown in detail.',
      },
      fix: {
        title: 'Finances & Cashflow',
        subtitle: 'Personal financial overview, monthly budget, income and fixed expenses in detail.',
      },
      kredite: {
        title: 'Loans & Liabilities',
        subtitle: 'Loan costs, interest rates, remaining balance tracking and direct lender links.',
      },
      energie: {
        title: 'Energy Center',
        subtitle: 'Meter numbers, contract terms, price guarantees and consumption history.',
      },
      lohn: {
        title: 'Salary & Career Growth',
        subtitle: 'Historical net and gross salary growth with percentage increases and milestones.',
      },
      konten: {
        title: 'Emergency Access & Accounts',
        subtitle: 'Central directory for banks, brokers and emergency financial instructions.',
      },
      portfolio: {
        title: 'Stock & Crypto Portfolio',
        subtitle: 'Asset management, automatic price updates, profit & loss analysis.',
      },
    },
    topBar: {
      monthlyIncome: 'Income',
      fixedExpenses: 'Fixed Expenses',
      freeSavingsRate: 'Savings Rate',
      remainingDebt: 'Remaining Debt',
      monthlyPayment: 'Payment / Mo',
      paidOff: 'Paid Off',
      selectedCount: 'Selected',
      fullscreenTooltip: 'Fullscreen',
      exitFullscreenTooltip: 'Exit Fullscreen',
    },
    cockpit: {
      personalOverview: 'Personal Financial Overview',
      finanzCockpit: 'Budget Cockpit',
      monthlyBudget: 'Available Monthly Budget',
      savingsRateQuote: 'Savings Rate',
      afterAllFix: 'after all monthly fixed expenses',
      monthlyIncome: 'Income',
      fixedExpenses: 'Fixed Expenses',
      savingsRate: 'Savings Rate',
      budgetAllocation: 'Budget Allocation',
      shareOfIncome: (amount) => `100% of total income (${amount})`,
      fixedShareLabel: (pct) => `Fixed (${pct}%)`,
      savingsShareLabel: (pct) => `Savings (${pct}%)`,
      debtSectionTitle: 'Remaining Debt & Liabilities',
      debtSectionSubtitle: 'Repayment status & loan overview directly in the cockpit',
      totalDebt: 'Total Remaining Debt',
      paidOff: 'Paid Off',
      ratenkredite: 'Consumer Loans',
      ratenkrediteSubtitle: 'Short & medium term (e.g. consumer, car, tax)',
      immobilien: 'Real Estate Loans',
      immobilienSubtitle: 'Long-term / mortgage loans',
      openCreditsBtn: 'Open Loans & Repayment Schedule',
      monthlyRateShort: 'Payment',
      viewAll: 'Overview',
      viewBudget: 'Budget',
      viewCredits: 'Loans',
    },
    krediteTab: {
      repaymentProgress: 'Repayment progress for selected loans',
      currentRestDebt: 'current remaining debt',
      activeCount: (active, total) => `${active} of ${total} active`,
      monthlyPayment: 'Monthly Payment',
      paid: 'Paid Off',
      paidPercentBadge: (pct) => `${pct}% Paid Off`,
      original: 'Original Amount',
      totalInterest: 'Total Interest',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      selectionHint: (active, total) => `(${active} of ${total} loans selected for calculation)`,
      addCredit: 'Add Loan',
      editCredit: 'Edit Loan',
      categoryLabel: 'Category',
      categoryRaten: 'Installment Loan (Consumer / Short-term)',
      categoryImmo: 'Real Estate Loan (Mortgage / Long-term)',
      tabAll: 'All Loans',
      tabRaten: 'Consumer Loans',
      tabImmo: 'Real Estate Loans',
      noBank: 'No bank stored',
      modalTitleEdit: 'Edit Loan',
      modalTitleNew: 'Create New Loan',
      purposeLabel: 'Description / Purpose',
      instituteLabel: 'Bank / Financial Institution',
      loanCategoryLabel: 'Loan Category',
      originalAmountLabel: 'Net Loan Amount',
      totalDebtLabel: 'Total Repayment Amount (incl. interest)',
      interestRateLabel: 'Interest Rate (% p.a.)',
      remainingDebtLabel: 'Current Remaining Balance',
      monthlyRateLabel: 'Monthly Installment',
      portalLinkLabel: 'Online Banking Portal URL',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete Loan',
    },
    fixTab: {
      distributionTitle: 'Expense Distribution',
      expenseDistributionTitle: 'Expense Distribution',
      incomeDistributionTitle: 'Income Distribution',
      incomeGroup: 'Income Group',
      activeCount: (active, total) => `${active} of ${total} active`,
      totalPerMonth: 'Month',
      category: 'Category',
      share: 'Share',
      amount: 'Amount',
      allDeselected: 'All categories deselected',
      clickToSelectHint: 'Click a category to enable it in the chart.',
      deselectedBadge: 'Deselected',
      fixedExpensesSection: 'Fixed Expenses',
      categoriesCount: (count) => `${count} Categories`,
      dragDropHint: 'Drag & drop items to reorder and move between categories',
      addCategory: 'Add Category',
      addItem: 'Add Item',
      incomeSection: 'Income',
      incomeSectionSubtitle: 'Salary, child benefit, rental income and side jobs',
      addIncomeGroup: 'Add Income Group',
      commercialScope: 'Commercial',
      privateScope: 'Private',
      taxDeductible: 'Tax deductible',
      confirmDeleteCat: 'Are you sure you want to delete this category and all its items?',
      selectedTotalExpenses: 'Selected Expenses',
      selectedTotalIncome: 'Selected Income',
      activeBadge: 'active',
      noActiveCategories: 'No active categories',
      activateCategoriesHint: 'Enable categories to display them in the chart.',
      categoryDistributionShare: 'Categories & Shares',
      categoryClickToToggle: 'Click to toggle in chart',
    },
    common: {
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
  },
  tr: {
    settings: {
      modalTitle: 'Ayarlar',
      modalSubtitle: 'Dil ve menü öğelerini yönetin. Verileriniz her zaman güvende kalır.',
      languageSection: 'Dil / Language / Sprache',
      languageDescription: 'Kullanıcı arayüzü için tercih ettiğiniz dili seçin.',
      currencySection: 'Para Birimi',
      currencyDescription: 'Tüm tutarlar, tablolar ve raporlar için tercih ettiğiniz para birimini seçin.',
      navSection: 'Menü & Navigasyon',
      navDescription: 'Menü öğelerini gösterin veya gizleyin. Gizlenen sekmelerdeki tüm verileriniz korunur.',
      activeMenuCount: (active, total) => `${active} / ${total} menü öğesi aktif`,
      enableAll: 'Tümünü etkinleştir',
      showAll: 'Tümünü göster',
      done: 'Tamam',
      close: 'Kapat',
      hiddenBadge: 'Gizli',
      noDataLossTitle: 'Veri kaybı yok:',
      noDataLossDesc: 'Gizlenen menü öğeleri kayıtlı tüm verilerinizi (gelirler, krediler, sayaç kayıtları vb.) olduğu gibi muhafaza eder. Sekmeyi tekrar açtığınızda her şey hemen geri gelir.',
      onlyOneActiveWarning: 'En az bir menü öğesi aktif kalmalıdır',
    },
    navigation: {
      settingsBtn: 'Ayarlar',
      settingsTooltip: 'Ayarlar (Dil ve menü öğeleri)',
      exportBtn: 'Yedekle',
      importBtn: 'İçe Aktar',
      fullscreen: 'Tam Ekran',
      exitFullscreen: 'Tam Ekrandan Çık',
      backupStatus: 'Yerel & kalıcı olarak kaydedildi',
      tabletView: 'Tablet Görünümü',
      autoMode: 'Oto',
      portraitMode: 'Dikey',
      landscapeMode: 'Yatay',
      tabs: {
        cockpit: {
          label: 'Kokpit',
          description: 'Kişisel finans genel bakışı, likidite ve hızlı erişim',
        },
        finanzen: {
          label: 'Finanslar',
          description: 'Aylık gelirler, sabit giderler ve kategori dağılımı',
        },
        fix: {
          label: 'Finanslar',
          description: 'Kişisel finans genel bakışı, aylık bütçe, gelirler ve sabit giderler',
        },
        kredite: {
          label: 'Krediler',
          description: 'Kredi özeti, aylık taksit, kalan anapara ve faizler',
        },
        energie: {
          label: 'Enerji',
          description: 'Elektrik ve gaz sözleşmeleri, sayaç okumaları, tüketim geçmişi',
        },
        lohn: {
          label: 'Maaş',
          description: 'Kariyer başlangıcından bu yana brüt ve net maaş gelişimi',
        },
        konten: {
          label: 'Acil Durum',
          description: 'Banka erişimleri, aracı kurum bağlantıları ve acil durum rehberi',
        },
        portfolio: {
          label: 'Portföy',
          description: 'Hisse senetleri, kripto paralar, canlı fiyatlar ve performans takibi',
        },
      },
    },
    tabHeadings: {
      cockpit: {
        title: 'Finans Kokpiti',
        subtitle: 'Bütçe, krediler, enerji ve hesaplar için merkezi genel bakış.',
      },
      finanzen: {
        title: 'Finanslar & Nakit Akışı',
        subtitle: 'Aylık gelirler, sabit giderler ve detaylı kategori dağılımı.',
      },
      fix: {
        title: 'Finanslar & Nakit Akışı',
        subtitle: 'Kişisel finans özeti, aylık bütçe, gelirler ve sabit giderlerin detayları.',
      },
      kredite: {
        title: 'Krediler & Borçlar',
        subtitle: 'Kredi maliyetleri, faiz oranları, kalan borç takibi ve banka bağlantıları.',
      },
      energie: {
        title: 'Enerji Merkezi',
        subtitle: 'Sayaç numaraları, sözleşme şartları, fiyat garantileri ve tüketim geçmişi.',
      },
      lohn: {
        title: 'Maaş & Kariyer Gelişimi',
        subtitle: 'Kariyer boyunca brüt ve net maaş artışı, yüzdesel gelişim ve aşamalar.',
      },
      konten: {
        title: 'Acil Durum & Hesaplar',
        subtitle: 'Bankalar, aracı kurumlar ve acil durum talimatları için rehber.',
      },
      portfolio: {
        title: 'Hisse & Kripto Portföyü',
        subtitle: 'Varlık yönetimi, otomatik fiyat güncellemeleri, kâr ve zarar analizi.',
      },
    },
    topBar: {
      monthlyIncome: 'Gelirler',
      fixedExpenses: 'Sabit Giderler',
      freeSavingsRate: 'Tasarruf Oranı',
      remainingDebt: 'Kalan Borç',
      monthlyPayment: 'Aylık Taksit',
      paidOff: 'Ödenen',
      selectedCount: 'Seçilen',
      fullscreenTooltip: 'Tam Ekran',
      exitFullscreenTooltip: 'Tam Ekrandan Çık',
    },
    cockpit: {
      personalOverview: 'Kişisel Finans Özeti',
      finanzCockpit: 'Bütçe Kokpiti',
      monthlyBudget: 'Kullanılabilir Aylık Bütçe',
      savingsRateQuote: 'Tasarruf Oranı',
      afterAllFix: 'tüm aylık sabit giderlerden sonra',
      monthlyIncome: 'Gelirler',
      fixedExpenses: 'Sabit Giderler',
      savingsRate: 'Tasarruf',
      budgetAllocation: 'Bütçe Dağılımı',
      shareOfIncome: (amount) => `Toplam gelirin %100'ü (${amount})`,
      fixedShareLabel: (pct) => `Sabit (${pct}%)`,
      savingsShareLabel: (pct) => `Tasarruf (${pct}%)`,
      debtSectionTitle: 'Kalan Borç & Yükümlülükler',
      debtSectionSubtitle: 'Ödeme durumu ve kredi takibi doğrudan kokpitte',
      totalDebt: 'Toplam Kalan Borç',
      paidOff: 'Ödenen',
      ratenkredite: 'Tüketici Kredileri',
      ratenkrediteSubtitle: 'Kısa & orta vadeli (örn. ihtiyaç, taşıt, vergi)',
      immobilien: 'Konut / Gayrimenkul Kredileri',
      immobilienSubtitle: 'Uzun vadeli ipotekli konut finansmanı',
      openCreditsBtn: 'Kredileri ve Ödeme Planını Aç',
      monthlyRateShort: 'Taksit',
      viewAll: 'Genel Bakış',
      viewBudget: 'Bütçe',
      viewCredits: 'Krediler',
    },
    krediteTab: {
      repaymentProgress: 'Seçilen kredilerin geri ödeme ilerlemesi',
      currentRestDebt: 'güncel kalan borç',
      activeCount: (active, total) => `${active} / ${total} aktif`,
      monthlyPayment: 'Aylık Taksit',
      paid: 'Ödenen',
      paidPercentBadge: (pct) => `%${pct} Ödendi`,
      original: 'Başlangıç Tutarı',
      totalInterest: 'Toplam Faiz',
      selectAll: 'Tümünü Seç',
      deselectAll: 'Tümünü Kaldır',
      selectionHint: (active, total) => `(Hesaplama için ${total} krediden ${active} adedi seçildi)`,
      addCredit: 'Kredi Ekle',
      editCredit: 'Krediyi Düzenle',
      categoryLabel: 'Kategori',
      categoryRaten: 'Tüketici Kredisi (Kısa/Orta Vadeli)',
      categoryImmo: 'Konut Kredisi (Uzun Vadeli İpotek)',
      tabAll: 'Tüm Krediler',
      tabRaten: 'Tüketici Kredileri',
      tabImmo: 'Konut Kredileri',
      noBank: 'Banka belirtilmedi',
      modalTitleEdit: 'Krediyi Düzenle',
      modalTitleNew: 'Yeni Kredi Tanımla',
      purposeLabel: 'Açıklama / Kullanım Amacı',
      instituteLabel: 'Banka / Finans Kuruluşu',
      loanCategoryLabel: 'Kredi Kategorisi',
      originalAmountLabel: 'Kredi Tutarı (Net)',
      totalDebtLabel: 'Toplam Geri Ödeme (Faiz & Masraflar Dahil)',
      interestRateLabel: 'Faiz Oranı (% yıllık)',
      remainingDebtLabel: 'Güncel Kalan Anapara',
      monthlyRateLabel: 'Aylık Taksit Tutarı',
      portalLinkLabel: 'Online Bankacılık Bağlantısı',
      cancel: 'İptal',
      save: 'Kaydet',
      delete: 'Krediyi Sil',
    },
    fixTab: {
      distributionTitle: 'Gider Dağılımı',
      expenseDistributionTitle: 'Gider Dağılımı',
      incomeDistributionTitle: 'Gelir Dağılımı',
      incomeGroup: 'Gelir Grubu',
      activeCount: (active, total) => `${active} / ${total} aktif`,
      totalPerMonth: 'Ay',
      category: 'Kategori',
      share: 'Oran',
      amount: 'Tutar',
      allDeselected: 'Tüm kategoriler kaldırıldı',
      clickToSelectHint: 'Grafikte etkinleştirmek için bir kategoriye tıklayın.',
      deselectedBadge: 'Seçilmedi',
      fixedExpensesSection: 'Sabit Giderler',
      categoriesCount: (count) => `${count} Kategori`,
      dragDropHint: 'Kalemleri sürükleyip bırakarak sıralayabilir ve kategoriler arasında taşıyabilirsiniz',
      addCategory: 'Kategori Ekle',
      addItem: 'Kalem Ekle',
      incomeSection: 'Gelirler',
      incomeSectionSubtitle: 'Maaş, çocuk parası, kira ve ek gelirler',
      addIncomeGroup: 'Gelir Grubu Ekle',
      commercialScope: 'Ticari / İş',
      privateScope: 'Özel / Bireysel',
      taxDeductible: 'Vergiden düşülebilir',
      confirmDeleteCat: 'Bu kategoriyi ve içindeki tüm kalemleri silmek istediğinizden emin misiniz?',
      selectedTotalExpenses: 'Seçilen Giderler',
      selectedTotalIncome: 'Seçilen Gelirler',
      activeBadge: 'aktif',
      noActiveCategories: 'Aktif kategori yok',
      activateCategoriesHint: 'Grafikte görüntülemek için kategorileri etkinleştirin.',
      categoryDistributionShare: 'Kategoriler ve Paylar',
      categoryClickToToggle: 'Grafikte açıp kapatmak için tıklayın',
    },
    common: {
      active: 'Aktif',
      inactive: 'Pasif',
      edit: 'Düzenle',
      delete: 'Sil',
      save: 'Kaydet',
      cancel: 'İptal',
      confirm: 'Onayla',
      yes: 'Evet',
      no: 'Hayır',
    },
  },
};

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string; nativeName: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' },
];
