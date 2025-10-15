import { useMutation } from '@tanstack/react-query';
import { useLessonStore } from '../store/lesson-store';

interface AnalyzeArgs {
    uri: string;
    targetWord: string;
    locale: string;
    mode?: 'word' | 'sentence';
}

// React Query mutation to analyze pronunciation via backend Azure Speech API
export function usePronunciationAnalysis() {
    const API_BASE_URL = process.env.EXPO_PUBLIC_PRONUN_API_BASE_URL || 'http://192.168.1.100:3001';
    const mockByEnv = (process.env.EXPO_PUBLIC_MOCK_PRONUNCIATION ?? 'false') === 'true';
    const mockByFlag = useLessonStore.getState()?.mockPronunciationAnalysis === true;

    return useMutation({
        mutationKey: ['pronunciation', 'analyze'],
        mutationFn: async ({ uri, targetWord, locale, mode = 'word' }: AnalyzeArgs) => {
            const useMock = mockByEnv || mockByFlag;

            if (useMock) {
                // Deterministic pseudo-random based on inputs
                const hashStr = (s: string) => {
                    let h = 0;
                    for (let i = 0; i < s.length; i++) {
                        h = (h << 5) - h + s.charCodeAt(i);
                        h |= 0;
                    }
                    return Math.abs(h);
                };
                const seed = hashStr(`${targetWord}:${locale}:${mode}`);
                const rng = (n: number) => {
                    const x = Math.sin(n) * 10000;
                    return x - Math.floor(x);
                };
                const base = rng(seed);
                // Overall 0.55–0.90 range, pronunciation slightly lower, accuracy a bit lower
                const overall = Math.round((0.55 + (base * 0.35)) * 100) / 100;
                const pronunciation = Math.round(Math.max(0.5, overall - 0.04) * 100) / 100;
                const accuracy = Math.round(Math.max(0.5, overall - 0.08) * 100) / 100;

                return {
                    scores: {
                        overall,
                        pronunciation,
                        accuracy,
                    },
                    feedback: `Mock analysis: ${Math.round(overall * 100)}% overall`
                } as any;
            }

            const formData = new FormData();
            formData.append('audio', {
                uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            } as any);
            formData.append('targetWord', targetWord);
            formData.append('locale', locale);
            formData.append('mode', mode);

            const res = await fetch(`${API_BASE_URL}/api/pronunciation/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                let detail: any = null;
                try { detail = await res.json(); } catch { }
                throw new Error(`HTTP ${res.status}${detail?.message ? `: ${detail.message}` : ''}`);
            }

            return res.json();
        },
    });
}