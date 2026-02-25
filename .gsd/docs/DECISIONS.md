# Architecture Decision Records

## Phase 2 Decisions - Universal Ralph Loop

**Date:** 2026-01-21

### Scope Decision

**Chosen:** Phase 2 = Universal Ralph Loop (siguiendo MILESTONE.md, no ROADMAP.md)

**Rationale:**
- MILESTONE.md es más reciente y refleja la visión correcta
- Alineado con objetivo "GSD Universal" (no depender de ningún IDE)
- Adapters contradicen la filosofía "pure protocol"

### Philosophical Approach

**Chosen:** Vision A - "Pure Protocol"

**Rationale:**
- GSD debe funcionar con cualquier AI en cualquier ambiente
- Terminal + ChatGPT = Kiro = VS Code + Copilot = Antigravity
- No dependencias de herramientas específicas
- Markdown + Git + Shell commands = suficiente

### Implementation Strategy

**Chosen:** Protocolo con scripts ejecutables (bash + PowerShell)

**Rationale:**
- Ralph es un protocolo que se implementa con scripts
- Los scripts funcionan en cualquier IDE (todos tienen consola)
- Indistinto si usás IDE o terminal directamente
- Scripts son universales, no específicos de IDE

### Adapters Decision

**Chosen:** Adapters opcionales, NO prioritarios

**Rationale:**
- Adapters pueden existir pero son secundarios
- Prioridad: protocolo universal que funcione en todos lados
- Adapters específicos (Kiro, Antigravity, Copilot) son nice-to-have
- No invertir tiempo en adapters hasta que protocolo universal esté completo

### Architecture Vision

**Chosen:** "GSD Universal" (no "GSD con adapters")

**Rationale:**
- Construimos un protocolo universal primero
- Optimizaciones específicas son opcionales después
- Simplicidad > Complejidad
- Portabilidad > Features específicas

## Impact on Roadmap

**Changes needed:**
1. Phase 2 debe ser "Universal Ralph Loop" (no "Adapter System")
2. Adapter System se mueve a Phase 5 como opcional
3. Foco en pure protocol, no en optimizaciones específicas

## Next Steps

1. Actualizar ROADMAP.md para reflejar estas decisiones
2. Planear Phase 2: Universal Ralph Loop
3. Mantener simplicidad y universalidad como principios guía
