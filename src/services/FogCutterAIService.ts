import { config } from '../config';

export interface MicroStep {
    id: string;
    text: string;
}

interface MicroStepsResponse {
    steps: string[];
}

const DEFAULT_FALLBACK_STEPS: MicroStep[] = [
    { id: '1', text: 'Write down what this task involves' },
    { id: '2', text: 'Identify the very first physical action' },
    { id: '3', text: 'Set a 5-minute timer and start only that first action' },
];

function parseMicroSteps(payload: unknown): MicroStep[] {
    if (
        !payload ||
        typeof payload !== 'object' ||
        !Array.isArray((payload as MicroStepsResponse).steps)
    ) {
        return DEFAULT_FALLBACK_STEPS;
    }

    const steps = (payload as MicroStepsResponse).steps
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 5);

    if (steps.length === 0) return DEFAULT_FALLBACK_STEPS;

    return steps.map((text, index) => ({
        id: String(index + 1),
        text: text.trim(),
    }));
}

/**
 * FogCutterAIService
 *
 * Given a vague task title, returns 3–5 concrete ADHD-friendly micro-steps.
 * Falls back to a sensible default list if AI is unavailable.
 */
const FogCutterAIService = {
    async generateMicroSteps(taskTitle: string): Promise<MicroStep[]> {
        const title = taskTitle.trim();
        if (!title) return DEFAULT_FALLBACK_STEPS;

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), config.aiTimeout);

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/microsteps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: title }),
                signal: controller.signal,
            });

            clearTimeout(timer);

            if (!response.ok) {
                console.warn('FogCutterAI: API error, using fallback steps');
                return DEFAULT_FALLBACK_STEPS;
            }

            let payload: unknown;
            try {
                payload = await response.json();
            } catch {
                return DEFAULT_FALLBACK_STEPS;
            }

            return parseMicroSteps(payload);
        } catch (err) {
            clearTimeout(timer);
            // Network errors / timeouts / CORS → silent fallback, not a UI crash
            console.warn('FogCutterAI: unavailable, using fallback steps', err);
            return DEFAULT_FALLBACK_STEPS;
        }
    },

    /** Default steps exposed for testing and offline display */
    defaultSteps: DEFAULT_FALLBACK_STEPS,
};

export default FogCutterAIService;
