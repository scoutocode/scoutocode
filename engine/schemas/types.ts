// schemas/types.ts - Types pour les schémas de configuration et formulaires

// ===========================================================================
// FORM SCHEMA TYPES - Décrit l'interface utilisateur
// ===========================================================================

/**
 * Actions disponibles dans les comportements de formulaire
 */
export type FormAction =
  | { action: 'setValue'; field: string; value?: unknown; valueExpr?: string }
  | { action: 'setFlag'; flag: string; value: boolean }
  | { action: 'toggleFlag'; flag: string }
  | { action: 'setFromPreset'; presetSource: string; presetIdExpr: string; maps: PresetMapping[] }
  | { action: 'computeShift'; fromField: string; toField: string; targetField: string };

export interface PresetMapping {
  from: string;  // chemin dans le preset (ex: "config.shift")
  to: string;    // champ cible dans le formulaire
}

export interface ConditionalActions {
  if: string;      // expression à évaluer
  do: FormAction[];
}

export interface FieldBehaviour {
  onChange?: ConditionalActions[];
  onClick?: FormAction[];
}

/**
 * Option pour un select
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Définition dynamique du label
 */
export interface DynamicLabel {
  if: string;
  then: string;
  else: string;
}

/**
 * Valeur calculée pour les champs computedText
 */
export interface ComputedValue {
  name: string;
  from: { source: string; using?: string }[];
}

/**
 * Action intégrée dans un champ (boutons dans infoBox par ex.)
 */
export interface FieldAction {
  type: 'button';
  label?: string;
  dynamicLabel?: DynamicLabel;
  behaviour: FieldBehaviour;
}

/**
 * Types de champs supportés
 */
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'group'
  | 'button'
  | 'computedText';

/**
 * Définition d'un champ de formulaire
 */
export interface FormField {
  name: string;
  type: FieldType;
  label?: string;
  description?: string;

  // Binding vers le schema de config
  bindsTo?: string;

  // Visibilité conditionnelle
  visibleWhen?: string;

  // Comportement
  behaviour?: FieldBehaviour;

  // Pour type 'number'
  min?: number;
  max?: number;

  // Pour type 'text'
  maxLength?: number;
  pattern?: string;
  transform?: 'uppercase' | 'lowercase';

  // Pour type 'select'
  options?: SelectOption[];
  optionsFrom?: string;  // référence à une source de presets
  default?: unknown;

  // Pour type 'group'
  layout?: 'horizontal' | 'vertical';
  children?: FormField[];

  // Pour type 'computedText'
  template?: string;
  computed?: ComputedValue[];
  actions?: FieldAction[];
}

/**
 * Schéma complet d'un formulaire
 */
export interface FormSchema {
  formId: string;
  title: string;
  description?: string;
  fields: FormField[];

  // Flags initiaux (état UI)
  initialFlags?: Record<string, boolean>;
}

// ===========================================================================
// CONFIG SCHEMA - Structure de la configuration (compatible JSON Schema)
// ===========================================================================

/**
 * Définition des séparateurs (commun à tous les encodeurs)
 */
export interface SeparatorsConfig {
  letter: string;
  word: string;
  phrase: string;
}

export const DEFAULT_SEPARATORS: SeparatorsConfig = {
  letter: ' / ',
  word: ' // ',
  phrase: ' /// ',
};

/**
 * Configuration de base pour tous les encodeurs
 */
export interface BaseEncoderConfig {
  separators?: Partial<SeparatorsConfig>;
}

// ===========================================================================
// REGISTRY D'ACTIONS
// ===========================================================================

/**
 * Contexte d'exécution d'une action
 */
export interface ActionContext {
  form: Record<string, unknown>;      // valeurs du formulaire
  flags: Record<string, boolean>;     // flags UI
  config: Record<string, unknown>;    // config résultante
  presets: Record<string, unknown[]>; // presets disponibles
}

/**
 * Handler d'action
 */
export type ActionHandler = (
  context: ActionContext,
  params: Record<string, unknown>
) => Partial<ActionContext>;

/**
 * Registry des handlers d'actions
 */
export const ACTION_HANDLERS: Record<string, ActionHandler> = {
  setValue: (ctx, params) => {
    const { field, value, valueExpr } = params as { field: string; value?: unknown; valueExpr?: string };
    const newValue = valueExpr ? evaluateExpr(valueExpr, ctx) : value;
    return { form: { ...ctx.form, [field]: newValue } };
  },

  setFlag: (ctx, params) => {
    const { flag, value } = params as { flag: string; value: boolean };
    return { flags: { ...ctx.flags, [flag]: value } };
  },

  toggleFlag: (ctx, params) => {
    const { flag } = params as { flag: string };
    return { flags: { ...ctx.flags, [flag]: !ctx.flags[flag] } };
  },

  setFromPreset: (ctx, params) => {
    const { presetSource, presetIdExpr, maps } = params as {
      presetSource: string;
      presetIdExpr: string;
      maps: PresetMapping[];
    };
    const presetId = evaluateExpr(presetIdExpr, ctx);
    const presets = ctx.presets[presetSource] as Array<{ id: string;[key: string]: unknown }>;
    const preset = presets?.find(p => p.id === presetId);
    if (!preset) return {};

    const updates: Record<string, unknown> = {};
    for (const map of maps) {
      updates[map.to] = getNestedValue(preset, map.from);
    }
    return { form: { ...ctx.form, ...updates } };
  },

  computeShift: (ctx, params) => {
    const { fromField, toField, targetField } = params as {
      fromField: string;
      toField: string;
      targetField: string;
    };
    const from = String(ctx.form[fromField] || 'A').toUpperCase();
    const to = String(ctx.form[toField] || 'A').toUpperCase();
    const shift = ((to.charCodeAt(0) - from.charCodeAt(0)) % 26 + 26) % 26;
    return { form: { ...ctx.form, [targetField]: shift } };
  },
};

// ===========================================================================
// HELPERS
// ===========================================================================

/**
 * Évalue une expression simple dans un contexte
 * Supporte: value, form.x, flags.x, -form.x, comparaisons simples
 */
export function evaluateExpr(expr: string, ctx: ActionContext): unknown {
  // Négation numérique: -form.shift
  if (expr.startsWith('-form.')) {
    const field = expr.slice(6);
    return -(ctx.form[field] as number);
  }

  // Accès simple: value, form.x, flags.x
  if (expr === 'value') return ctx.form['_currentValue'];
  if (expr.startsWith('form.')) return ctx.form[expr.slice(5)];
  if (expr.startsWith('flags.')) return ctx.flags[expr.slice(6)];

  // Comparaisons: value === 'none', flags.x === true
  const eqMatch = expr.match(/^(.+?)\s*===\s*(.+)$/);
  if (eqMatch) {
    const left = evaluateExpr(eqMatch[1].trim(), ctx);
    const right = parseValue(eqMatch[2].trim());
    return left === right;
  }

  const neqMatch = expr.match(/^(.+?)\s*!==\s*(.+)$/);
  if (neqMatch) {
    const left = evaluateExpr(neqMatch[1].trim(), ctx);
    const right = parseValue(neqMatch[2].trim());
    return left !== right;
  }

  // ET logique: x && y
  if (expr.includes('&&')) {
    const parts = expr.split('&&').map(p => p.trim());
    return parts.every(p => evaluateExpr(p, ctx));
  }

  // Valeur littérale
  return parseValue(expr);
}

function parseValue(s: string): unknown {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  const n = Number(s);
  if (!isNaN(n)) return n;
  return s;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], obj);
}
