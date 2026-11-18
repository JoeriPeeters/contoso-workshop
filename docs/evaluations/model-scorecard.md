# Model scorecard — rule R1 (pensionableSalary)

> One run is a sample, not a benchmark. Synthetic data only — never paste secrets or real member data.

| | Model A | Model B | Model C |
|---|---|---|---|
| Model (name as shown in the picker) | Sol | Sonnet | (fill in) |
| Harness · Mode · Permissions | Copilot · Interactive · Manual | Copilot · Interactive · Manual | (fill in) |
| Reasoning effort | | | |
| Date | | | |

## Scores

| Criterion | How to score | Model A | Model B | Model C |
|---|---|---|---|---|
| Correctness verified | Expected values that match the `node -e` output (x / 5) | 5/5 | 5/5 | 5/5 |
| Edge cases found | Which did it cover? franchise boundary · salary cap · part-time · below franchise → 0 · invalid factor (0 or > 1) · negative salary | franchise boundary, salary cap, part-time, invalid factor, negative salary (missed: below franchise) | franchise boundary, salary cap, part-time, invalid factor, negative salary (missed: below franchise) | franchise boundary, below franchise → 0 (salary 0), cap boundary (exactly 137800), invalid factor 0 (missed: salary above cap, negative salary, factor > 1) |
| Hallucinations | Invented functions, parameters, files or rules? List them (none = 👍) | none in recorded outputs | none in recorded outputs | none in recorded outputs |
| Latency feel | fast / ok / slow | | | |
| Cost / credits | Relative cost of the model (supported-models doc) — heavier model = more AI credits | | | |

## Model outputs (verified against `pensionableSalary`)

### Model A — Sol

```text
17545 1 0
137800 0.5 60127.5
137801 1 120255
-1 1 RangeError: fullTimeSalary must be a non-negative number
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
```

### Model B — Sonnet

```text
17545 1 0
137801 1 120255
50000 0.333 10807.52
50000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
-1 1 RangeError: fullTimeSalary must be a non-negative number
```

### Model C MAI Code

```text
0 0.5 0
17545 1 0
17545.01 1 0.01
137800 1 120255
100000 0 RangeError: partTimeFactor must be greater than 0 and at most 1
```

## Verdict

### Edge-case coverage

| Category | A (Sol) | B (Sonnet) | C |
|---|---|---|---|
| Franchise boundary | ✅ | ✅ | ✅ |
| Salary cap | ✅ (137800 and 137801) | ✅ (137801) | ⚠️ only exactly 137800, so the cap never clips |
| Part-time | ✅ (0.5) | ✅ (0.333, with rounding) | ⚠️ 0.5 only, on a salary of 0 |
| Below franchise → 0 | ❌ | ❌ | ✅ (salary 0) |
| Invalid factor | ✅ (0) | ✅ (0) | ✅ (0) |
| Negative salary | ✅ | ✅ | ❌ |
| **Covered** | 5/6 | 5/6 | 4/6 |

- A and B are tied at 5/6; both missed "below franchise".
- C is behind at 4/6, but it is the only one that tested below the franchise, and it found the sharpest rounding boundary (`17545.01 → 0.01`).
- No model covered everything: nobody tested a factor above 1. The union of A + C covers all 6 categories.
- Conclusion: no single model's edge cases are complete. Combine outputs or explicitly prompt for the missing categories.

### Decision

- For **this kind of task** I would use: **any of the three**; this run does not clearly distinguish them. Sol or Sonnet for broader coverage.
- Because: all three produced 5/5 correct values. Sol tested the cap exactly and a half-time factor; Sonnet tested fractional-cent rounding; C tested the franchise floor and a one-cent boundary.
- Would I trust it **without** the `node -e` check? **No** — exact values and error messages need to be checked against the function.
- To make this a real benchmark I would need: the same scoring criteria across 10+ tasks, 3+ runs per model, and measured latency and credit usage.