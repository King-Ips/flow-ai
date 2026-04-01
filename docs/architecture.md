
#### 2. docs/architecture.md (create this folder & file)

```markdown
# FlowAI Architecture

## High-Level Flow
User Input (voice/text) → Scheduler Engine → Time Engine → Notification Engine → Voice Engine → UI

## Main Components
1. **UI Layer** – What the user sees and clicks/speaks to
2. **Scheduler Engine** – Creates, sorts, and stores tasks
3. **Time Engine** – The brain that runs every minute and checks “what should happen now?”
4. **Notification Engine** – Decides when and what to say
5. **Voice Engine** – Speech-to-text and text-to-speech
6. **Adjustment Engine** (added in Phase 3) – Recalculates schedule when you’re late/early

## Data Structure (example)
```json
{
  "day": "Monday",
  "wakeUpTime": "06:00",
  "tasks": [
    {
      "id": 1,
      "title": "Gym",
      "start": "06:30",
      "end": "07:30",
      "priority": "medium"
    }
  ]
}