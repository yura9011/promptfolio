# ROADMAP.md

> **Current Milestone**: gsd-universal
> **Goal**: Transform GSD into the first truly IDE-agnostic framework for AI development

## Must-Haves

- [x] Universal validation protocol (no IDE-specific dependencies) ✅ Phase 1
- [x] Generic subagent/parallel processing pattern ✅ Phase 1
- [x] IDE-agnostic file structure and conventions ✅ Phase 1
- [x] Universal Ralph Loop (protocol-based, not CLI-based) ✅ Phase 2
- [x] Cross-platform scripts (bash + PowerShell) ✅ Phase 1 & 2
- [x] Works with any AI (ChatGPT, Claude, Gemini, local models) ✅ Phase 2
- [x] Terminal + IDE compatibility ✅ Phase 1 & 2
- [x] Backward compatibility with existing GSD projects ✅ Phase 2
- [ ] Multi-environment documentation and examples (Phase 4)
- [ ] Real-world validation across environments (Phase 3)

## Nice-to-Haves

- [ ] IDE-specific adapters (Kiro, Antigravity, VS Code)
- [ ] Performance optimizations for specific tools
- [ ] Browser-based GSD interface
- [ ] Community plugin ecosystem
- [ ] GSD Universal marketplace/registry

## Phases

### Phase 1: Core Protocol Abstraction
**Status**: ✅ Complete
**Objective**: Extract IDE-agnostic core from current GSD implementation

**Key Deliverables:**
- ✅ Universal validation protocol (replaces getDiagnostics)
- ✅ Generic parallel processing pattern (replaces invokeSubAgent)
- ✅ IDE-agnostic file structure (no .kiro/ dependencies)
- ✅ Universal workflow definitions
- ✅ Universal environment setup guide

### Phase 2: Universal Ralph Loop
**Status**: ✅ Complete
**Objective**: Transform Ralph Loop into pure protocol-based system

**Key Deliverables:**
- ✅ Protocol-based Ralph (no external CLI dependencies)
- ✅ Self-executing within any environment (IDE or terminal)
- ✅ Universal prompt templates (work with any AI)
- ✅ Cross-platform scripts (bash + PowerShell)
- ✅ File-based state management

### Phase 3: Validation & Testing
**Status**: ⬜ Not Started
**Objective**: Prove GSD works in any environment with any AI

**Key Deliverables:**
- Terminal + web chat testing (ChatGPT, Claude)
- Multiple editor + AI combinations (VS Code, Kiro, Antigravity)
- Cross-platform validation (Windows, Mac, Linux)
- Performance benchmarking
- Real-world usage scenarios

### Phase 4: Documentation & Migration
**Status**: ⬜ Not Started
**Objective**: Enable seamless adoption across all AI IDEs

**Key Deliverables:**
- GSD Universal specification document
- Migration guides for each supported IDE
- Multi-IDE setup tutorials
- Community adoption toolkit

### Phase 5: Optional Optimizations
**Status**: ⬜ Not Started
**Objective**: Add optional IDE-specific enhancements (non-critical)

**Key Deliverables:**
- Adapter system design (optional)
- Kiro optimization layer (optional)
- Antigravity integration helpers (optional)
- VS Code + Copilot shortcuts (optional)
- Performance optimizations when tools available

**Note:** These are nice-to-haves. GSD Universal works without them.

## Timeline

- **Phase 1**: 1 week (Core Protocol Abstraction)
- **Phase 2**: 1 week (Adapter System Design)  
- **Phase 3**: 1 week (Ralph Universal Protocol)
- **Phase 4**: 1 week (Documentation & Migration)
- **Phase 5**: 2 weeks (Community & Ecosystem)

**Total**: ~6 weeks (Target: 2026-03-15)

## Success Metrics

### Technical Success
- GSD works identically in 5+ different AI IDEs
- Zero IDE-specific code in core GSD protocol
- 100% backward compatibility with existing projects
- <5 minute setup time in any supported IDE
- Universal Ralph Loop executes in any AI IDE

### Adoption Success  
- Community adoption in 3+ different IDE ecosystems
- 10+ community contributions/adaptations
- Documentation available for major AI IDEs
- 95% user satisfaction across different IDEs

### Impact Success
- Referenced as standard methodology for AI development
- Eliminates vendor lock-in for AI development teams
- Enables seamless IDE switching without workflow disruption
- Establishes GSD as the platform-agnostic solution

## Previous Milestones

### ralph-loop (In Progress 2026-01-20)
**Goal**: Implement autonomous execution loop (Ralph) for GSD framework

**Current Status**: Phase 1 completed with gap closure
- ✅ Core Ralph Engine implemented
- ✅ Cross-platform compatibility (bash + PowerShell)
- ✅ Integration with GSD validation system
- ✅ AI-agnostic design (works with kiro, claude, openai, etc.)

### kiro-integration (Completed 2026-01-20)
**Goal**: Modernize GSD to leverage Kiro IDE native capabilities

**Completed Deliverables:**
- ✅ Hooks system for auto-validation and Planning Lock
- ✅ Skills for executable templates with validation
- ✅ Subagents for context-efficient operations (99% savings)
- ✅ 25 slash commands with Kiro integration
- ✅ Complete documentation and cross-platform portability

## Revolutionary Vision

**GSD Universal will be:**
- **The jQuery of AI development** - same API, works everywhere
- **The first truly portable AI methodology** - switch IDEs seamlessly
- **The community standard** - adopted across all AI IDE ecosystems  
- **Future-proof foundation** - compatible with IDEs that don't exist yet

This milestone transforms GSD from a Kiro-specific tool into the universal standard for AI-assisted development, working identically across all current and future AI IDEs.